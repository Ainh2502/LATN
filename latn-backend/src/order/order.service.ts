import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Prisma, PaymentStatus, FulfillmentStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /** 🧮 Tính giá khuyến mãi theo scopeJson (brandIds/categoryIds/minPrice/maxPrice) */
  private async computeEffectivePrice(variantId: string): Promise<number> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { brand: true, category: true } } },
    });
    if (!variant)
      throw new BadRequestException(`Không tìm thấy biến thể ${variantId}`);

    const base = Number(variant.priceOverride ?? variant.product.price ?? 0);

    const promotions = await this.prisma.promotion.findMany({
      where: {
        status: 'ACTIVE',
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
    });

    if (!promotions.length) return base;

    let best = base;
    for (const promo of promotions) {
      const scope = promo.scopeJson as any;
      const inBrand =
        Array.isArray(scope?.brandIds) &&
        scope.brandIds.includes(variant.product.brandId);
      const inCategory =
        Array.isArray(scope?.categoryIds) &&
        scope.categoryIds.includes(variant.product.categoryId);
      const inPrice =
        (!scope?.minPrice || base >= Number(scope.minPrice)) &&
        (!scope?.maxPrice || base <= Number(scope.maxPrice));

      if (inBrand || inCategory || inPrice) {
        let candidate = base;
        const type = String(promo.type || '').trim().toUpperCase();
        if (type === 'PERCENTAGE' || type === 'PERCENT') {
          candidate = Math.round((base * (100 - Number(promo.value || 0))) / 100);
        } else if (type === 'FIXED' || type === 'AMOUNT' || type === 'VND') {
          candidate = Math.max(0, base - Number(promo.value || 0));
        }
        if (candidate < best) best = candidate;
      }
    }

    return best;
  }

  /** 🧾 Tạo đơn hàng — tính giá từ Cart (có KM, quà tặng, coupon, kiểm tra & trừ kho) */
  async create(dto: CreateOrderDto, user: any) {
    if (!user?.id) throw new ForbiddenException('Thiếu userId');
    if (!dto.addressId) throw new BadRequestException('Thiếu địa chỉ giao hàng');
    if (!dto.items?.length) throw new BadRequestException('Giỏ hàng trống');

    // ✅ Kiểm tra địa chỉ hợp lệ
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    });
    if (!address) throw new BadRequestException('Địa chỉ không hợp lệ');

    // ✅ Kiểm tra tồn kho từng biến thể trước khi tạo đơn
    for (const i of dto.items) {
      const inv = await this.prisma.inventory.findFirst({
        where: { variantId: i.variantId },
      });
      if (!inv)
        throw new BadRequestException(`Không tìm thấy tồn kho cho biến thể ${i.variantId}`);
      if (inv.stockOnHand < i.quantity) {
        throw new BadRequestException(
          `Biến thể ${i.variantId} chỉ còn ${inv.stockOnHand} sản phẩm, không đủ để đặt ${i.quantity}.`,
        );
      }
    }

    // ✅ Lấy giỏ hàng để lấy giá snapshot
    const cart = await this.prisma.cart.findFirst({
      where: { userId: user.id },
      include: { items: true },
    });

    // ✅ Chuẩn bị OrderItem
    const itemsData = await Promise.all(
      dto.items.map(async (i) => {
        const cartItem = cart?.items.find((ci) => ci.variantId === i.variantId);

        const priceSnap =
          cartItem?.priceSnap ?? (await this.computeEffectivePrice(i.variantId));

        const variant = await this.prisma.productVariant.findUnique({
          where: { id: i.variantId },
          select: {
            id: true,
            sku: true,
            productId: true,
            product: { select: { name: true } },
          },
        });

        if (!variant)
          throw new BadRequestException(`Không tìm thấy biến thể ${i.variantId}`);

        return {
          variantId: i.variantId,
          productId: variant.productId,
          name: variant.product.name,
          sku: variant.sku,
          price: priceSnap,
          qty: i.quantity,
          total: priceSnap * i.quantity,
        };
      }),
    );

    const subtotal = itemsData.reduce((sum, i) => sum + i.total, 0);

    // ===== TÍNH COUPON – CHUẨN HOÁ KIỂU CHỮ =====
    let discountTotal = 0;
    let appliedCouponCode: string | null = null;
    let coupon: any = null;

    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });
      if (!coupon) throw new BadRequestException('Mã coupon không tồn tại');
      if (coupon.status !== 'ACTIVE')
        throw new BadRequestException('Mã coupon đã hết hạn hoặc không hoạt động');

      const now = new Date();
      if (coupon.startAt && coupon.startAt > now)
        throw new BadRequestException('Mã coupon chưa tới hạn');
      if (coupon.endAt && coupon.endAt < now)
        throw new BadRequestException('Mã coupon đã hết hạn');

      const userCoupon = await this.prisma.userCoupon.findUnique({
        where: {
          userId_couponCode: { userId: user.id, couponCode: coupon.code },
        },
      });

      if (coupon.userLimit && (userCoupon?.usedCount ?? 0) >= coupon.userLimit) {
        throw new BadRequestException('Bạn đã dùng hết lượt cho mã này');
      }
      if (coupon.maxUses && coupon.used >= coupon.maxUses) {
        throw new BadRequestException('Mã giảm giá đã đạt giới hạn');
      }

      const type = String(coupon.type || '').trim().toUpperCase();
      if (type === 'PERCENTAGE' || type === 'PERCENT') {
        discountTotal = Math.round(subtotal * (Number(coupon.value || 0) / 100));
      } else if (type === 'FIXED' || type === 'AMOUNT' || type === 'VND') {
        discountTotal = Number(coupon.value || 0);
      } else {
        discountTotal = 0;
      }

      // Không để giảm vượt quá subtotal
      discountTotal = Math.max(0, Math.min(discountTotal, subtotal));
      appliedCouponCode = coupon.code;
    }

    const shippingFee = 0;
    const taxTotal = 0;
    const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee + taxTotal);

    // ✅ Transaction tạo Order + trừ kho
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          code: `ORD-${Date.now()}`,
          userId: user.id,
          addressId: dto.addressId,
          subtotal,
          discountTotal,
          shippingFee,
          taxTotal,
          grandTotal,
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.DRAFT,
          appliedCouponCode,
          items: { create: itemsData },
          payments: {
            create: {
              method: dto.paymentMethod || 'COD',
              provider: 'LATN',
              amount: grandTotal,
              status: PaymentStatus.PENDING,
            },
          },
          shipments: {
            create: {
              provider: 'STANDARD',
              fee: shippingFee,
              status: 'DRAFT',
            },
          },
        },
        include: { items: true, payments: true, shipments: true },
      });

      // 🔻 TRỪ TỒN KHO
      for (const item of newOrder.items) {
        await tx.inventory.updateMany({
          where: { variantId: item.variantId },
          data: { stockOnHand: { decrement: item.qty } },
        });
      }

      return newOrder;
    });

    // ✅ Cập nhật lượt sử dụng coupon (giữ nguyên)
    if (appliedCouponCode && coupon) {
      await this.prisma.$transaction([
        this.prisma.coupon.update({
          where: { code: appliedCouponCode },
          data: {
            used: { increment: 1 },
            ...(coupon.maxUses && coupon.used + 1 >= coupon.maxUses
              ? { status: 'EXPIRED' }
              : {}),
          },
        }),
        this.prisma.userCoupon.upsert({
          where: {
            userId_couponCode: { userId: user.id, couponCode: appliedCouponCode },
          },
          update: { usedCount: { increment: 1 } },
          create: { userId: user.id, couponCode: appliedCouponCode, usedCount: 1 },
        }),
      ]);
    }

    return { message: '🧾 Đã tạo đơn hàng thành công', order };
  }

  // 🧨 Hủy đơn / Hoàn tiền (Customer) + hoàn lại tồn kho
async cancelOrder(id: string, user: any) {
  const order = await this.prisma.order.findUnique({
    where: { id },
    include: {
      shipments: true,
      items: true, // ✅ cần items để hoàn kho
    },
  });

  if (!order) throw new NotFoundException('Không tìm thấy đơn hàng.');

  // 🧩 Kiểm tra quyền
  const isAdminOrStaff = ['ADMIN', 'STAFF'].includes(user.role);
  const isCustomer = user.role === 'CUSTOMER';

  // 👉 Nếu là khách hàng thì vẫn phải là chủ đơn
  if (isCustomer && order.userId !== user.id) {
    throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này.');
  }

  // 👉 Nếu không phải admin/staff và không phải customer hợp lệ
  if (!isAdminOrStaff && !isCustomer) {
    throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này.');
  }

  // ⚙️ Nếu KHÔNG phải admin/staff → vẫn kiểm tra điều kiện thời gian & trạng thái
  if (!isAdminOrStaff) {
    const now = new Date();
    const diffMs = now.getTime() - order.createdAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const shipStatus = order.shipments[0]?.status ?? 'DRAFT';

    const canCancel =
      diffDays <= 1 || (diffDays > 7 && ['DRAFT', 'PENDING'].includes(shipStatus));

    if (!canCancel) {
      throw new BadRequestException(
        'Đơn hàng không đủ điều kiện để yêu cầu hủy / hoàn tiền.',
      );
    }
  }

  // 💳 Nếu đã thanh toán → hoàn tiền (REFUNDED)
  // Nếu chưa thanh toán → đánh dấu thanh toán thất bại (FAILED)
  const newPaymentStatus: PaymentStatus =
    order.paymentStatus === PaymentStatus.PAID
      ? PaymentStatus.REFUNDED
      : PaymentStatus.FAILED;

  // 🧾 Transaction cập nhật + hoàn kho
  const updatedOrder = await this.prisma.$transaction(async (tx) => {
    const up = await tx.order.update({
      where: { id },
      data: {
        paymentStatus: newPaymentStatus,
        fulfillmentStatus: FulfillmentStatus.CANCELLED,
      },
    });

    // 🚚 Cập nhật trạng thái giao hàng
    await tx.shipment.updateMany({
      where: { orderId: id },
      data: { status: 'CANCELLED' },
    });

    // 💳 Cập nhật trạng thái thanh toán
    await tx.payment.updateMany({
      where: { orderId: id },
      data: { status: newPaymentStatus },
    });

    // 🔺 HOÀN LẠI TỒN KHO
    for (const item of order.items) {
      if (!item.variantId || !item.qty) continue;
      await tx.inventory.updateMany({
        where: { variantId: item.variantId },
        data: { stockOnHand: { increment: item.qty } },
      });
    }

    return up;
  });

  return {
    message:
      newPaymentStatus === PaymentStatus.REFUNDED
        ? '💰 Đơn hàng đã được hoàn tiền và hoàn kho thành công.'
        : '🛑 Đơn hàng đã được hủy và hoàn kho thành công.',
    updatedOrder,
  };
}


  /** 📋 Danh sách đơn hàng */
  async findAll(user: any) {
    if (!user) throw new ForbiddenException('User không hợp lệ');
    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';

    return this.prisma.order.findMany({
      where: isAdmin ? {} : { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        address: true,
        items: true,
        payments: true,
        shipments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 🔍 Chi tiết đơn hàng (+ màu/size + ảnh chính) */
  async findOne(id: string, user: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        items: true,
        payments: true,
        shipments: true,
      },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (user.role === 'CUSTOMER' && order.userId !== user.id)
      throw new ForbiddenException('Không có quyền truy cập đơn hàng này');

    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        });

        const opts = (variant?.optionJson as any) || {};
        const color = opts.color || opts.màu || null;
        const size = opts.size || opts.kíchThước || null;

        const imageUrl =
          variant?.product?.images?.[0]?.url ||
          'https://via.placeholder.com/80x80?text=No+Image';

        return {
          ...item,
          productImage: imageUrl,
          color,
          size,
        };
      }),
    );

    return { ...order, items: itemsWithDetails };
  }

  /** ✏️ Cập nhật trạng thái đơn hàng (Admin/Staff) */
  async update(id: string, dto: UpdateOrderDto, user: any) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';
    if (!isAdmin)
      throw new ForbiddenException('Chỉ Admin hoặc Staff có quyền cập nhật');

    const data: Prisma.OrderUpdateInput = {};

    if (dto.paymentStatus) {
      data.paymentStatus = { set: dto.paymentStatus as PaymentStatus };
      await this.prisma.payment.updateMany({
        where: { orderId: id },
        data: { status: dto.paymentStatus as PaymentStatus },
      });
    }

    if (dto.fulfillmentStatus) {
      if (dto.fulfillmentStatus === 'SHIPPED') {
        const sh = await this.prisma.shipment.findFirst({
          where: { orderId: id },
          select: { provider: true },
        });
        if (sh && sh.provider === 'STANDARD') {
          throw new BadRequestException({
            code: 'CHOOSE_PROVIDER_REQUIRED',
            message:
              'Vui lòng chọn đối tác giao hàng trước khi chuyển sang SHIPPED.',
            providers: ['GHN', 'GHTK', 'J&T', 'VIETTELPOST'],
          });
        }
      }

      data.fulfillmentStatus = { set: dto.fulfillmentStatus as FulfillmentStatus };
      await this.prisma.shipment.updateMany({
        where: { orderId: id },
        data: { status: dto.fulfillmentStatus },
      });
    }

    if (dto.discountTotal !== undefined) data.discountTotal = dto.discountTotal;
    if (dto.shippingFee !== undefined) data.shippingFee = dto.shippingFee;
    if (dto.grandTotal !== undefined) data.grandTotal = dto.grandTotal;
    if (dto.appliedCouponCode) data.appliedCouponCode = dto.appliedCouponCode;

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: { items: true, payments: true, shipments: true },
    });

    return { message: '✅ Đã cập nhật đơn hàng', updated };
  }

  /** 🎟️ Áp mã coupon thủ công (Admin) */
  async applyCoupon(orderId: string, code: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (order.appliedCouponCode && order.appliedCouponCode !== code)
      throw new BadRequestException('Chỉ được áp dụng 1 mã giảm giá mỗi đơn hàng');

    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new BadRequestException('Mã không tồn tại');
    if (coupon.status !== 'ACTIVE')
      throw new BadRequestException('Mã này đã hết hạn hoặc ngưng hoạt động');

    const now = new Date();
    if (coupon.startAt && coupon.startAt > now)
      throw new BadRequestException('Mã chưa đến thời gian sử dụng');
    if (coupon.endAt && coupon.endAt < now)
      throw new BadRequestException('Mã đã hết hạn');

    const type = String(coupon.type || '').trim().toUpperCase();
    let discount = 0;
    if (type === 'PERCENTAGE' || type === 'PERCENT') {
      discount = Math.round(order.subtotal * (Number(coupon.value || 0) / 100));
    } else if (type === 'FIXED' || type === 'AMOUNT' || type === 'VND') {
      discount = Number(coupon.value || 0);
    }
    discount = Math.max(0, Math.min(discount, order.subtotal));

    const newGrandTotal = Math.max(
      0,
      order.subtotal - discount + order.shippingFee + (order.taxTotal ?? 0),
    );

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        discountTotal: discount,
        appliedCouponCode: coupon.code,
        grandTotal: newGrandTotal,
      },
    });

    return {
      message: `Đã áp dụng mã ${coupon.code}`,
      discount,
      grandTotal: newGrandTotal,
    };
  }

  /** 🗑️ Xoá đơn hàng + dữ liệu liên quan */
  async remove(id: string, user: any) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';
    if (!isAdmin)
      throw new ForbiddenException('Chỉ Admin hoặc Staff có quyền xóa đơn hàng');

    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, shipments: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy đơn hàng');

    await this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({ where: { orderId: id } }),
      this.prisma.payment.deleteMany({ where: { orderId: id } }),
      this.prisma.shipment.deleteMany({ where: { orderId: id } }),
      this.prisma.order.delete({ where: { id } }),
    ]);

    return { message: '🗑️ Đã xoá đơn hàng và toàn bộ dữ liệu liên quan' };
  }
}

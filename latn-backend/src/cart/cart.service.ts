import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

/**
 * 🧮 Hàm tính finalPrice cơ bản dựa vào compareAt
 */
function calcFinalPrice(product: any): { finalPrice: number; discountPercent: number } {
  if (!product) return { finalPrice: 0, discountPercent: 0 };

  const base = Number(product.price ?? 0);
  const compare = Number(product.compareAt ?? 0);

  if (!compare || compare <= base) {
    return { finalPrice: base, discountPercent: 0 };
  }

  const percent = Math.round(((compare - base) / compare) * 100);
  return { finalPrice: base, discountPercent: percent };
}

/**
 * 🧠 Hàm lấy giá khuyến mãi thực tế từ bảng Promotion
 * Dựa theo brandId / categoryId / minPrice / maxPrice
 */
async function getEffectivePrice(prisma: PrismaService, variant: any): Promise<{
  effectivePrice: number;
  appliedPromotion: { id: string; name: string; type: string; value: number } | null;
}> {
  const product = await prisma.product.findUnique({
    where: { id: variant.productId },
    include: { brand: true, category: true },
  });
  if (!product) {
    return { effectivePrice: Number(variant.priceOverride ?? 0), appliedPromotion: null };
  }

  const base = Number(variant.priceOverride ?? product.price ?? 0);

  const promotions = await prisma.promotion.findMany({
    where: {
      status: 'ACTIVE',
      startAt: { lte: new Date() },
      endAt: { gte: new Date() },
    },
  });

  if (!promotions.length) {
    return { effectivePrice: base, appliedPromotion: null };
  }

  let best = base;
  let applied: any = null;

  for (const promo of promotions) {
  const scope = promo.scopeJson as any || {}; // ⚡ nếu null thì coi là {}
  const base = Number(variant.priceOverride ?? product.price ?? 0);

  const inBrand =
    Array.isArray(scope.brandIds) && scope.brandIds.includes(product.brandId);
  const inCategory =
    Array.isArray(scope.categoryIds) && scope.categoryIds.includes(product.categoryId);
  const inPrice =
    (!scope.minPrice || base >= Number(scope.minPrice)) &&
    (!scope.maxPrice || base <= Number(scope.maxPrice));

  // ✅ Nếu khuyến mãi không có điều kiện (null hoặc rỗng) thì áp dụng toàn cục
  const isGlobal =
    (!scope.brandIds || scope.brandIds.length === 0) &&
    (!scope.categoryIds || scope.categoryIds.length === 0) &&
    !scope.minPrice &&
    !scope.maxPrice;

  // ✅ Áp dụng nếu: (global) hoặc ((brand hoặc category) && trong khoảng giá)
  if (isGlobal || ((inBrand || inCategory) && inPrice)) {
    let candidate = base;
    if (promo.type === 'percentage') {
      candidate = Math.round((base * (100 - promo.value)) / 100);
    } else if (promo.type === 'fixed') {
      candidate = Math.max(0, base - promo.value);
    }

    if (candidate < best) {
      best = candidate;
      applied = promo;
    }
  }
}

  return {
    effectivePrice: best,
    appliedPromotion: applied
      ? {
          id: applied.id,
          name: applied.name,
          type: applied.type,
          value: applied.value,
        }
      : null,
  };
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🧠 Lấy giỏ hàng hiện tại (tính giá khuyến mãi động)
   */
  async getCart(userId: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new NotFoundException(`User ${userId} not found`);

    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: true, brand: true, category: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { include: { images: true, brand: true, category: true } },
                },
              },
            },
          },
        },
      });
    }

    // ✅ Áp dụng khuyến mãi động cho từng sản phẩm trong giỏ
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        // ⚠️ FIX: Nếu sản phẩm là quà tặng (priceSnap = 0) => bỏ qua tính khuyến mãi
        if (item.priceSnap === 0) {
          return {
            ...item,
            variant: {
              ...item.variant,
              product: {
                ...item.variant.product,
                finalPrice: 0,
                discountPercent: 0,
                appliedPromotion: null,
              },
            },
          };
        }

        const { effectivePrice, appliedPromotion } = await getEffectivePrice(this.prisma, item.variant);
        const { discountPercent } = calcFinalPrice(item.variant.product);

        return {
          ...item,
          priceSnap: effectivePrice,
          variant: {
            ...item.variant,
            product: {
              ...item.variant.product,
              finalPrice: effectivePrice,
              discountPercent,
              appliedPromotion,
            },
          },
        };
      }),
    );

    return { ...cart, items: enrichedItems };
  }

  /**
   * ➕ Thêm sản phẩm vào giỏ hàng (có áp dụng khuyến mãi)
   */
  async addItem(userId: string, variantId: string, quantity: number) {
    const cart = await this.getCart(userId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { brand: true, category: true } } },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    const { effectivePrice, appliedPromotion } = await getEffectivePrice(this.prisma, variant);
    const priceSnap = effectivePrice;

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
        priceSnap,
        // Bạn có thể thêm trường appliedPromotionId nếu DB có
        // appliedPromotionId: appliedPromotion?.id,
      },
    });
  }

  /**
   * 🔁 Cập nhật số lượng (và áp dụng lại giá khuyến mãi)
   */
  async updateItem(itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: { include: { product: true } } },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    const { effectivePrice } = await getEffectivePrice(this.prisma, item.variant);

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity, priceSnap: effectivePrice },
    });
  }

  /**
   * ❌ Xóa sản phẩm khỏi giỏ hàng
   */
  async removeItem(itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  /**
   * 🧹 Xóa toàn bộ giỏ hàng
   */
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: '🧹 Cart cleared successfully' };
  }
}

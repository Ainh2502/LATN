import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { randomInt } from 'crypto';
import { FulfillmentStatus } from '@prisma/client'; // ✅ thêm dòng này
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  /** 🔐 Chỉ cho phép ADMIN hoặc STAFF */
  private ensureAdmin(user: any) {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      throw new ForbiddenException('Chỉ Admin hoặc Staff có quyền thao tác vận đơn');
    }
  }

  /** 📋 Danh sách toàn bộ vận đơn */
  async findAll(user: any) {
    this.ensureAdmin(user);
    return this.prisma.shipment.findMany({
      include: {
        order: {
          select: { id: true, code: true, userId: true, fulfillmentStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 🔍 Chi tiết một vận đơn */
  async findOne(id: string, user: any) {
    this.ensureAdmin(user);
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          select: { id: true, code: true, userId: true, fulfillmentStatus: true },
        },
      },
    });
    if (!shipment) throw new NotFoundException('Không tìm thấy vận đơn');
    return shipment;
  }

 /** ✏️ Cập nhật thông tin vận đơn (auto generate tracking nếu sang SHIPPED / DELIVERED / CANCELLED) */
/** ✏️ Cập nhật thông tin vận đơn (auto tracking + đồng bộ trạng thái order) */
async update(id: string, dto: UpdateShipmentDto, user: any) {
  this.ensureAdmin(user);

  const existing = await this.prisma.shipment.findUnique({
    where: { id },
    include: { order: true },
  });
  if (!existing) throw new NotFoundException('Không tìm thấy vận đơn');

  const newStatus = dto.status ?? existing.status;
  let newTracking = existing.tracking;

  // ✅ Tự tạo tracking khi sang SHIPPED / DELIVERED / CANCELLED (chưa có tracking)
  if (
    ['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(newStatus) &&
    !existing.tracking
  ) {
    newTracking = `LATN-ORD-${existing.orderId.slice(-6)}-${randomInt(1000, 9999)}`;
  }

  // ✅ Cập nhật shipment
  const updated = await this.prisma.shipment.update({
    where: { id },
    data: {
      provider: dto.provider ?? existing.provider,
      fee: typeof dto.fee === 'number' ? dto.fee : existing.fee,
      status: newStatus,
      tracking: newTracking,
      raw: dto.raw ?? existing.raw ?? undefined,
    },
    include: {
      order: { select: { id: true, code: true, fulfillmentStatus: true } },
    },
  });

  // ✅ Đồng bộ trạng thái order (mọi trạng thái)
  await this.prisma.order.update({
    where: { id: existing.orderId },
    data: {
    fulfillmentStatus: newStatus as FulfillmentStatus, // ✅ ép kiểu enum
    },
  });
// ✅ Nếu đơn hàng đã giao (DELIVERED) mà chưa thanh toán, auto chuyển thành PAID
if (newStatus === 'DELIVERED') {
  const order = await this.prisma.order.findUnique({
    where: { id: existing.orderId },
    select: { paymentStatus: true },
  });

  if (order && order.paymentStatus !== PaymentStatus.PAID) {
    await this.prisma.order.update({
      where: { id: existing.orderId },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  }
}

  return {
    message:
      !existing.tracking && ['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(newStatus)
        ? `🚚 Đã cập nhật và tạo mã vận đơn (${newTracking})`
        : '🚚 Đã cập nhật vận đơn & đồng bộ trạng thái đơn hàng',
    updated,
  };
}
// shipment.service.ts
async setProviderByOrder(orderId: string, provider: string, user: any) {
  const validProviders = ['GHN', 'GHTK', 'VIETTELPOST', 'BESTEXPRESS'];
  if (!validProviders.includes(provider)) {
    throw new BadRequestException(`Provider ${provider} không hợp lệ`);
  }

  const shipment = await this.prisma.shipment.findFirst({
    where: { orderId },
  });
  if (!shipment) throw new NotFoundException('Không tìm thấy vận đơn');

  // ✅ Ghi log user cập nhật (nếu cần)
  console.log(`👤 ${user?.email ?? 'Unknown'} cập nhật provider cho đơn ${orderId}`);

  // ✅ Cập nhật provider & status
  const updated = await this.prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      provider,
      status: 'SHIPPED',
      tracking: `AUTO-${provider}-${Date.now()}`,
    },
  });

  // ✅ Đồng bộ trạng thái đơn hàng
  await this.prisma.order.update({
    where: { id: orderId },
    data: { fulfillmentStatus: 'SHIPPED' },
  });

  return updated;
}



  /** 🗑️ Xoá vận đơn */
  async remove(id: string, user: any) {
    this.ensureAdmin(user);
    await this.prisma.shipment.delete({ where: { id } });
    return { message: '🗑️ Đã xoá vận đơn' };
  }
}

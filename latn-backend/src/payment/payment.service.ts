/* 
 * LATN Modules - Generated scaffolding
 * Payment & Shipment modules for NestJS + Prisma
 * Includes: controller, service, module, DTOs, and entities (placeholders)
 */

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /** Admin/Staff only */
  private ensureAdmin(user: any) {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      throw new ForbiddenException('Chỉ Admin hoặc Staff có quyền thao tác thanh toán');
    }
  }

  findAll(user: any) {
    this.ensureAdmin(user);
    return this.prisma.payment.findMany({
      include: { order: { select: { id: true, code: true, userId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    this.ensureAdmin(user);
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, code: true, userId: true } } },
    });
    if (!payment) throw new NotFoundException('Không tìm thấy thanh toán');
    return payment;
  }

async update(id: string, dto: UpdatePaymentDto, user: any) {
  this.ensureAdmin(user);

  const existing = await this.prisma.payment.findUnique({
    where: { id },
    include: { order: true }, // ✅ có thể giữ để so sánh fulfillmentStatus hiện tại
  });
  if (!existing) throw new NotFoundException('Không tìm thấy thanh toán');

  const newStatus = (dto.status as PaymentStatus) ?? existing.status;

  // ✅ Cập nhật payment và lấy kèm order
  const updated = await this.prisma.payment.update({
    where: { id },
    data: {
      status: newStatus,
      transactionId: dto.transactionId ?? existing.transactionId ?? null,
      raw: dto.raw ?? existing.raw ?? undefined,
      provider: dto.provider ?? existing.provider,
      method: dto.method ?? existing.method,
      amount: typeof dto.amount === 'number' ? dto.amount : existing.amount,
      currency: dto.currency ?? existing.currency,
    },
    include: { order: true }, // ✅ thêm dòng này để có updated.order
  });

  // ✅ Đồng bộ trạng thái paymentStatus sang Order
  await this.prisma.order.update({
    where: { id: updated.orderId },
    data: { paymentStatus: newStatus },
  });

  // ✅ Nếu đơn hàng đã giao (DELIVERED) mà thanh toán chưa PAID, thì auto set PAID
  if (
    updated.order?.fulfillmentStatus === 'DELIVERED' &&
    newStatus !== PaymentStatus.PAID
  ) {
    await this.prisma.order.update({
      where: { id: updated.orderId },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  }

  return {
    message: '💳 Đã cập nhật và đồng bộ trạng thái thanh toán',
    updated,
  };
}


  async remove(id: string, user: any) {
    this.ensureAdmin(user);
    await this.prisma.payment.delete({ where: { id } });
    return { message: '🗑️ Đã xoá bản ghi thanh toán' };
  }
}

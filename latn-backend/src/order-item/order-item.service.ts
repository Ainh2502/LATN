import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class OrderItemService {
  constructor(private prisma: PrismaService) {}

  listByOrder(orderId: string) {
    return this.prisma.orderItem.findMany({ where: { orderId } });
  }

  create(data: any) {
    const total = (data.price - (data.discount ?? 0)) * data.qty;
    return this.prisma.orderItem.create({ data: { ...data, total } });
  }

  update(id: string, data: any) {
    return this.prisma.orderItem.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.orderItem.delete({ where: { id } });
  }
}

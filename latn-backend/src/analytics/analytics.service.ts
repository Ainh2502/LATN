import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async revenueByMonth(year: number) {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lt: end }, paymentStatus: 'PAID' },
      select: { createdAt: true, grandTotal: true },
    });

    const buckets: Record<string, number> = {};
    for (let m = 1; m <= 12; m++) buckets[String(m).padStart(2,'0')] = 0;

    for (const o of orders) {
      const m = String((o.createdAt.getUTCMonth() + 1)).padStart(2, '0');
      buckets[m] += o.grandTotal;
    }
    return buckets;
  }

  async topProducts(limit = 5) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      _sum: { qty: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });
    return items;
  }

  async topCustomers(limit = 5) {
    const orders = await this.prisma.order.groupBy({
      by: ['userId'],
      _sum: { grandTotal: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: limit,
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: orders.map(o => o.userId) } },
      select: { id: true, email: true, name: true },
    });

    const map = new Map(users.map(u => [u.id, u]));
    return orders.map(o => ({
      user: map.get(o.userId),
      total: o._sum.grandTotal || 0,
    }));
  }
}

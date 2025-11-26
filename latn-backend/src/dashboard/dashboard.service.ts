import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

 // dashboard.service.ts
async getOverview() {
  const [users, products, orders, revenue] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.product.count(),
    this.prisma.order.count(),
    this.prisma.order.aggregate({
      _sum: { grandTotal: true }, // ✅ dùng grandTotal thay vì total
      where: { paymentStatus: 'PAID' }, // ✅ chỉ tính đơn đã thanh toán
    }),
  ]);

  return {
    users,
    products,
    orders,
    revenue: revenue._sum.grandTotal ?? 0,
  };
}

}

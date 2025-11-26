import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class UserCouponService {
  constructor(private prisma: PrismaService) {}

  async listAll() {
    return this.prisma.userCoupon.findMany({
      orderBy: { userId : 'desc' },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.userCoupon.findMany({
      where: { userId },
      orderBy: { userId : 'desc' },
    });
  }

  async add(userId: string, couponCode: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    if (!coupon) throw new NotFoundException('Không tìm thấy voucher');

    return this.prisma.userCoupon.create({
      data: { userId, couponCode },
    });
  }

  async remove(id: string) {
    return this.prisma.userCoupon.delete({ where: { id } });
  }
}
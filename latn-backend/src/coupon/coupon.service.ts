import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

list() {
  return this.prisma.coupon.findMany({
    orderBy: { code: 'asc' },
  });
}


  getByCode(code: string) {
    return this.prisma.coupon.findUnique({ where: { code } });
  }

create(data: any) {
  const payload = {
    ...data,
    value: Number(data.value),
    minOrderTotal: data.minOrderTotal ? Number(data.minOrderTotal) : null,
    maxUses: data.maxUses ? Number(data.maxUses) : null,
    userLimit: data.userLimit ? Number(data.userLimit) : null,
    startAt: data.startAt ? new Date(data.startAt) : null,
    endAt: data.endAt ? new Date(data.endAt) : null,
  };
  return this.prisma.coupon.create({ data: payload });
}


update(code: string, data: any) {
  const payload = {
    ...data,
    value: Number(data.value),
    minOrderTotal: data.minOrderTotal ? Number(data.minOrderTotal) : null,
    maxUses: data.maxUses ? Number(data.maxUses) : null,
    userLimit: data.userLimit ? Number(data.userLimit) : null,
    startAt: data.startAt ? new Date(data.startAt) : null,
    endAt: data.endAt ? new Date(data.endAt) : null,
  };
  return this.prisma.coupon.update({ where: { code }, data: payload });
}


  remove(code: string) {
    return this.prisma.coupon.delete({ where: { code } });
  }
}

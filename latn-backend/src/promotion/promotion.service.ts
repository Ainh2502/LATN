import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  CreateCouponDto,
  UpdateCouponDto,
  ListQueryDto,
} from './dto';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  // ========== PROMOTION ==========
  async listPromotions(q: ListQueryDto) {
    const { status, search, skip = 0, take = 20 } = q;
    return this.prisma.promotion.findMany({
      where: {
        status: status || undefined,
        AND: search
          ? [
              {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { type: { contains: search, mode: 'insensitive' } },
                ],
              },
            ]
          : undefined,
      },
      orderBy: [
        { startAt: 'desc' }, // có thể null: Prisma vẫn OK
        { endAt: 'desc' },
      ],
      skip,
      take,
    });
  }

  async getPromotion(id: string) {
    const found = await this.prisma.promotion.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy khuyến mãi');
    return found;
  }

  async createPromotion(dto: CreatePromotionDto) {
    const { startAt, endAt, scopeJson, ...rest } = dto;
    return this.prisma.promotion.create({
      data: {
        ...rest,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      scopeJson: scopeJson ?? {}, // ✅ ép về {}
      },
    });
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    await this.getPromotion(id);
    const { startAt, endAt, scopeJson, ...rest } = dto;
    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...rest,
        startAt: startAt === undefined ? undefined : startAt ? new Date(startAt) : null,
        endAt: endAt === undefined ? undefined : endAt ? new Date(endAt) : null,
        scopeJson: scopeJson === undefined ? undefined : scopeJson,
      },
    });
  }

  async deletePromotion(id: string) {
    await this.getPromotion(id);
    return this.prisma.promotion.delete({ where: { id } });
  }

  // ========== COUPON ==========
  async listCoupons(q: ListQueryDto) {
    const { status, search, skip = 0, take = 20 } = q;
    return this.prisma.coupon.findMany({
      where: {
        status: status || undefined,
        AND: search
          ? [
              {
                OR: [
                  { code: { contains: search, mode: 'insensitive' } },
                  { type: { contains: search, mode: 'insensitive' } },
                ],
              },
            ]
          : undefined,
      },
      orderBy: [{ startAt: 'desc' }, { endAt: 'desc' }],
      skip,
      take,
    });
  }

  async getCoupon(id: string) {
    const found = await this.prisma.coupon.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy mã giảm giá');
    return found;
  }

  async createCoupon(dto: CreateCouponDto) {
    const { startAt, endAt, ...rest } = dto;
    return this.prisma.coupon.create({
      data: {
        ...rest,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    await this.getCoupon(id);
    const { startAt, endAt, ...rest } = dto;
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...rest,
        startAt: startAt === undefined ? undefined : startAt ? new Date(startAt) : null,
        endAt: endAt === undefined ? undefined : endAt ? new Date(endAt) : null,
      },
    });
  }

  async deleteCoupon(id: string) {
    await this.getCoupon(id);
    return this.prisma.coupon.delete({ where: { id } });
  }
}

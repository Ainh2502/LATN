import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {

  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('coupon')
@Controller('coupon')
export class CouponController {
  constructor(
    private readonly service: CouponService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List coupons' })
  list() {
    return this.service.list();
  }
// ================================
  // 🎡 Random voucher ACTIVE cho user
  // ================================
  @UseGuards(JwtAuthGuard)
@Get('random')
@ApiOperation({ summary: 'Random 1 voucher đang ACTIVE và gán cho user hiện tại' })
async randomCoupon(@Req() req: any) {
  const userId = req.user?.id || req.user?.userId || req.user?.sub;
  if (!userId) throw new NotFoundException('Không xác định được người dùng');

  const coupons = await this.prisma.coupon.findMany({
    where: { status: 'ACTIVE' },
  });

  if (coupons.length === 0)
    throw new NotFoundException('Không có voucher khả dụng');

  const random = coupons[Math.floor(Math.random() * coupons.length)];

  const exists = await this.prisma.userCoupon.findFirst({
    where: { userId, couponCode: random.code },
  });

  if (exists) {
    return { message: '🔁 Bạn đã sở hữu voucher này trước đó!', coupon: random };
  }

  await this.prisma.userCoupon.create({
    data: { userId, couponCode: random.code },
  });

  return { message: '🎉 Chúc mừng! Bạn đã nhận được voucher ngẫu nhiên!', coupon: random };
}

  @Get(':code')
  @ApiOperation({ summary: 'Get coupon by code' })
  get(@Param('code') code: string) {
    return this.service.getByCode(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create coupon' })
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto as any);
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Update coupon' })
  update(@Param('code') code: string, @Body() dto: UpdateCouponDto) {
    return this.service.update(code, dto as any);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Delete coupon' })
  remove(@Param('code') code: string) {
    return this.service.remove(code);
  }
}

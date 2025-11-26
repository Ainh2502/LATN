import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, PrismaService],
})
export class CouponModule {}

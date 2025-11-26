import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UserCouponController } from './user-coupon.controller';
import { UserCouponService } from './user-coupon.service';

@Module({
  controllers: [UserCouponController],
  providers: [UserCouponService, PrismaService],
})
export class UserCouponModule {}
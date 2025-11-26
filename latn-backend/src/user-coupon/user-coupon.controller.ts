import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserCouponService } from './user-coupon.service';

@ApiTags('user-coupon')
@Controller('user-coupon')
export class UserCouponController {
  constructor(private readonly service: UserCouponService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách toàn bộ user-coupon (admin)' })
  listAll() {
    return this.service.listAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Danh sách voucher của 1 user cụ thể' })
  listByUser(@Param('userId') userId: string) {
    return this.service.listByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm voucher cho user (vd: khi trúng thưởng)' })
  add(@Body() dto: { userId: string; couponCode: string }) {
    return this.service.add(dto.userId, dto.couponCode);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bản ghi user-coupon' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
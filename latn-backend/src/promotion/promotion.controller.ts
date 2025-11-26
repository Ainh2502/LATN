import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  CreateCouponDto,
  UpdateCouponDto,
  ListQueryDto,
} from './dto';

@ApiTags('promotion')
@ApiBearerAuth()
@Controller()
export class PromotionController {
  constructor(private readonly service: PromotionService) {}

  // ======= PROMOTIONS =======
  @Get('promotions')
  @ApiOperation({ summary: '📋 Danh sách khuyến mãi' })
  listPromotions(@Query() q: ListQueryDto) {
    return this.service.listPromotions(q);
  }

  @Get('promotions/:id')
  @ApiOperation({ summary: '🔍 Chi tiết khuyến mãi' })
  getPromotion(@Param('id') id: string) {
    return this.service.getPromotion(id);
  }

  @Post('promotions')
  @ApiOperation({ summary: '➕ Tạo khuyến mãi' })
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.service.createPromotion(dto);
  }

  @Patch('promotions/:id')
  @ApiOperation({ summary: '✏️ Cập nhật khuyến mãi' })
  updatePromotion(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.service.updatePromotion(id, dto);
  }

  @Delete('promotions/:id')
  @ApiOperation({ summary: '🗑️ Xoá khuyến mãi' })
  deletePromotion(@Param('id') id: string) {
    return this.service.deletePromotion(id);
  }

  // ======= COUPONS (VOUCHER) =======
  @Get('coupons')
  @ApiOperation({ summary: '📋 Danh sách voucher' })
  listCoupons(@Query() q: ListQueryDto) {
    return this.service.listCoupons(q);
  }

  @Get('coupons/:id')
  @ApiOperation({ summary: '🔍 Chi tiết voucher' })
  getCoupon(@Param('id') id: string) {
    return this.service.getCoupon(id);
  }

  @Post('coupons')
  @ApiOperation({ summary: '➕ Tạo voucher' })
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.service.createCoupon(dto);
  }

  @Patch('coupons/:id')
  @ApiOperation({ summary: '✏️ Cập nhật voucher' })
  updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.service.updateCoupon(id, dto);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: '🗑️ Xoá voucher' })
  deleteCoupon(@Param('id') id: string) {
    return this.service.deleteCoupon(id);
  }
}

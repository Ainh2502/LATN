import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('oder')
@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
@Post(':id/apply-coupon')
async applyCoupon(
  @Param('id') orderId: string,
  @Body('code') code: string,
) {
  return this.orderService.applyCoupon(orderId, code);
}

  // 🧾 Khách hàng tạo đơn hàng
  @Post()
  async create(@Body() dto: CreateOrderDto, @GetUser() user: any) {
    return this.orderService.create(dto, user);
  }

  // 📋 Danh sách đơn hàng (Admin → toàn bộ, Customer → của mình)
  @Get()
  async findAll(@GetUser() user: any) {
    return this.orderService.findAll(user);
  }

  // 🔍 Chi tiết đơn hàng
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.orderService.findOne(id, user);
  }

  // ✏️ Cập nhật trạng thái (Admin / Staff)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @GetUser() user: any,
  ) {
    return this.orderService.update(id, dto, user);
  }
// order.controller.ts
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @GetUser() user: any) {
    return this.orderService.cancelOrder(id, user);
  }

  // 🗑️ Xóa đơn hàng (Admin / Staff)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.orderService.remove(id, user);
  }
}

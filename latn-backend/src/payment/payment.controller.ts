/* 
 * LATN Modules - Generated scaffolding
 * Payment & Shipment modules for NestJS + Prisma
 * Includes: controller, service, module, DTOs, and entities (placeholders)
 */

import { Controller, Get, Param, Patch, Body, Delete, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('payment')
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thanh toán (Admin/Staff)' })
  findAll(@GetUser() user: any) {
    return this.service.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thanh toán (Admin/Staff)' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thanh toán (Admin/Staff)' })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto, @GetUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá thanh toán (Admin/Staff)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.service.remove(id, user);
  }
}

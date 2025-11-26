import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@ApiTags('order-item')
@Controller('order-item')
export class OrderItemController {
  constructor(private readonly service: OrderItemService) {}

  @Get()
  @ApiOperation({ summary: 'List order items by orderId' })
  list(@Query('orderId') orderId: string) {
    return this.service.listByOrder(orderId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an order item' })
  create(@Body() dto: CreateOrderItemDto) {
    return this.service.create(dto as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order item' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderItemDto) {
    return this.service.update(id, dto as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

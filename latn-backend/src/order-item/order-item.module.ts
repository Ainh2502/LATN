import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';

@Module({
  controllers: [OrderItemController],
  providers: [OrderItemService, PrismaService],
})
export class OrderItemModule {}

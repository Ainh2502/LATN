/* 
 * LATN Modules - Generated scaffolding
 * Payment & Shipment modules for NestJS + Prisma
 * Includes: controller, service, module, DTOs, and entities (placeholders)
 */

import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentPublicController } from './payment-public.controller';
import { PrismaModule } from '../config/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule], // phải có ConfigModule
  controllers: [PaymentController,PaymentPublicController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

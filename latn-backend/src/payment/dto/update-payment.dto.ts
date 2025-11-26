/* 
 * LATN Modules - Generated scaffolding
 * Payment & Shipment modules for NestJS + Prisma
 * Includes: controller, service, module, DTOs, and entities (placeholders)
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Trạng thái thanh toán' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Mã giao dịch từ cổng thanh toán (nếu có)' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu thô trả về từ cổng thanh toán' })
  @IsOptional()
  @IsObject()
  raw?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;
}

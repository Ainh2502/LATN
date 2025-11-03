/* 
 * LATN Modules - Generated scaffolding
 * Payment & Shipment modules for NestJS + Prisma
 * Includes: controller, service, module, DTOs, and entities (placeholders)
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateShipmentDto {
  @ApiPropertyOptional({ description: 'Trạng thái vận đơn (CREATED/IN_TRANSIT/DELIVERED/CANCELLED...)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Mã vận đơn (tracking) từ hãng vận chuyển' })
  @IsOptional()
  @IsString()
  tracking?: string;

  @ApiPropertyOptional({ description: 'Đơn vị vận chuyển (GHN, GHTK, STANDARD...)' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Phí vận chuyển' })
  @IsOptional()
  @IsNumber()
  fee?: number;

  @ApiPropertyOptional({ description: 'Dữ liệu thô của vận chuyển' })
  @IsOptional()
  @IsObject()
  raw?: any;
}

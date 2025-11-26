import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

class InventoryInputDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockOnHand?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockReserved?: number;
}

export class CreateVariantDto {
  @ApiProperty({ example: 'cmghtzltz00034jrbvg1k5ehc' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'SKU-TEE-M-BLACK-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiPropertyOptional({ example: { size: 'M', color: 'BLACK' } })
  @IsOptional()
  @IsObject()
  optionJson?: Record<string, any>;

  @ApiPropertyOptional({ example: 175000 })
  @IsOptional()
  @IsInt()
  priceOverride?: number;

  @ApiPropertyOptional({ example: 0.3 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ type: InventoryInputDto })
  @IsOptional()
  inventory?: InventoryInputDto;
}

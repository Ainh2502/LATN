import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'order_id_123' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'product_id_abc' })
  @IsString()
  productId!: string;

  @ApiProperty({ example: 'variant_id_def' })
  @IsString()
  variantId!: string;

  @ApiProperty({ example: 'Áo thun basic' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'SKU-TEE-M-BLACK' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 120000 })
  @IsInt()
  price!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  qty!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  discount?: number;
}

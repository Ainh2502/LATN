import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'SALE10' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'percentage' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  value!: number;

  @ApiPropertyOptional({ example: 300000 })
  @IsOptional()
  @IsInt()
  minOrderTotal?: number;

  @ApiPropertyOptional({ example: '2025-10-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  maxUses?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  userLimit?: number;
}

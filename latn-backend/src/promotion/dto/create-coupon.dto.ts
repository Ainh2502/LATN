import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ description: 'Kiểu giảm: PERCENT / FIXED / ...' })
  @IsString()
  type!: string;
  @ApiProperty() @IsInt() value!: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() minOrderTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() maxUses?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() userLimit?: number;
  @ApiPropertyOptional({ default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}

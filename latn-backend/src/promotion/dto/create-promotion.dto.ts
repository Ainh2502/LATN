import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsInt, 
  IsDateString, 
  IsObject 
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ description: 'Kiểu giảm: PERCENT / FIXED / ...' })
  @IsString()
  type!: string;
  @ApiProperty() @IsInt() value!: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() minOrderTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startAt?: string; // ISO
  @ApiPropertyOptional() @IsOptional() @IsDateString() endAt?: string;   // ISO
  @ApiPropertyOptional() @IsOptional() @IsInt() usageLimit?: number;
  @ApiPropertyOptional({ default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
  description: 'Phạm vi áp dụng khuyến mãi',
  example: {
    categoryIds: ['cat1', 'cat2'],
    brandIds: ['brand1'],
    minPrice: 100000,
    maxPrice: 500000,
  },
})
@IsOptional()
@IsObject()
scopeJson?: {
  categoryIds?: string[];
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
};

  
}

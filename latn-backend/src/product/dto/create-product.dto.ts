import { ProductStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsInt() price!: number;

  @IsOptional() @IsInt() compareAt?: number;
  @IsOptional() @IsString() shortDesc?: string;
  @IsOptional() @IsString() longDesc?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsString() categoryId?: string;

  // ✅ Thêm dòng này để khớp với Prisma schema
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'cmgxyz...' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'ID người dùng (nếu không lấy từ JWT)', example: 'cmgabc...' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Số sao 1–5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'Tiêu đề', example: 'Chất lượng rất tốt' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung', example: 'Đóng gói cẩn thận, giao nhanh.' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Danh sách ảnh (URL)', type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsOptional()
  images?: string[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AttributeFilterDto {
  @ApiProperty({ example: 'size', description: 'Tên thuộc tính cần lọc' })
  @IsString()
  @IsNotEmpty()
  key!: string; // ✅ thêm dấu ! để TypeScript hiểu chắc chắn sẽ được gán

  @ApiProperty({ example: 'M', description: 'Giá trị của thuộc tính cần lọc' })
  @IsString()
  @IsNotEmpty()
  value!: string; // ✅ thêm dấu !
}

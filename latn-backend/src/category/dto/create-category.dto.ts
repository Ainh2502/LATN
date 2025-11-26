import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Áo thun' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ao-thun' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'cmgqazet000129l61uoazibn0' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

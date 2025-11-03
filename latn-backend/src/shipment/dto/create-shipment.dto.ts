import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 'order_id_123' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'GHN' })
  @IsString()
  provider!: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsInt()
  fee?: number;
}

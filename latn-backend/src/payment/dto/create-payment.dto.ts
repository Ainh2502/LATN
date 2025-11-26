import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'order_id_123' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'VNPAY' })
  @IsString()
  method!: string;

  @ApiProperty({ example: 'VNPay Gateway' })
  @IsString()
  provider!: string;

  @ApiProperty({ example: 150000 })
  @IsInt()
  amount!: number;

  @ApiProperty({ example: 'VND' })
  @IsString()
  currency!: string;
}

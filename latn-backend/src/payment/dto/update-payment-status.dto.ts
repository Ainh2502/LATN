import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdatePaymentStatusDto {
  @ApiProperty({ example: 'PAID', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] })
  @IsEnum(['PENDING','PAID','FAILED','REFUNDED'], { message: 'Invalid status' })
  status!: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
}

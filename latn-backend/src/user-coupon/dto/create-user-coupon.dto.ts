import { IsString } from 'class-validator';

export class CreateUserCouponDto {
  @IsString()
  userId?: string;

  @IsString()
  couponCode?: string;
}
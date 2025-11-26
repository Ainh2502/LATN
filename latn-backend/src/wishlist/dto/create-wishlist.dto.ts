import { IsString } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  userId!: string; // ✅ thêm dấu "!"

  @IsString()
  productId!: string; // ✅ thêm dấu "!"
}

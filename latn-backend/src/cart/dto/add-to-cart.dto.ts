import { IsString, IsInt, Min } from 'class-validator';

/**
 * DTO dùng khi thêm sản phẩm vào giỏ hàng
 */
export class AddToCartDto {
  @IsString()
  variantId!: string; // ✅ ID biến thể sản phẩm (ProductVariant.id)

  @IsInt()
  @Min(1)
  quantity!: number; // ✅ Số lượng thêm
}

import { IsInt, Min } from 'class-validator';

/**
 * DTO dùng khi cập nhật số lượng sản phẩm trong giỏ
 */
export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity!: number; // ✅ Số lượng mới
}

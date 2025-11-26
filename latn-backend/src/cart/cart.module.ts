import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../config/prisma.module';

/**
 * 🧩 Module Cart
 * Quản lý toàn bộ API giỏ hàng (Cart)
 * - Lấy giỏ hàng
 * - Thêm sản phẩm
 * - Cập nhật số lượng
 * - Xóa sản phẩm / làm trống giỏ
 */

@Module({
  imports: [PrismaModule],     // ✅ Kết nối với PrismaService
  controllers: [CartController], // ✅ Nơi định nghĩa các API endpoint
  providers: [CartService],      // ✅ Chứa logic xử lý nghiệp vụ
})
export class CartModule {}

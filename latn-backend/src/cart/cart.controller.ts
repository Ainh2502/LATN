import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ✅ Guard xác thực JWT
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../config/prisma.service';
import { NotFoundException } from '@nestjs/common';

/**
 * Interface mở rộng cho Request (có user từ JWT)
 */
interface AuthRequest extends Request {
  user?: {
    id?: string;
    userId?: string;
    role?: string;
  };
}

@UseGuards(JwtAuthGuard) // ✅ Toàn bộ route trong Cart yêu cầu JWT hợp lệ
@ApiTags('cart')
@Controller('cart')
export class CartController {
constructor(
  private readonly cartService: CartService,
  private readonly prisma: PrismaService, // 👈 thêm dòng này
) {}

  /**
   * 🧠 Lấy userId từ JWT hoặc query (fallback)
   */
  private resolveUserId(req: AuthRequest, queryUserId?: string): string {
    // ✅ Hỗ trợ cả id và userId
    if (req.user?.id) return req.user.id;
    if (req.user?.userId) return req.user.userId;

    if (queryUserId) return queryUserId;
    throw new UnauthorizedException('⚠️ Bạn cần đăng nhập để sử dụng giỏ hàng');
  }

  // =========================
  // 📦 Lấy giỏ hàng hiện tại
  // =========================
  @Get()
  async getCart(@Req() req: AuthRequest, @Query('userId') userId?: string) {
    const resolvedId = this.resolveUserId(req, userId);
    return this.cartService.getCart(resolvedId);
  }
  // 🎁 Thêm sản phẩm miễn phí cho user hiện tại
 @Post('free/:productId')
async addFreeProduct(@Param('productId') productId: string, @Req() req: AuthRequest) {
  const userId = this.resolveUserId(req);

  const cart = await this.cartService.getCart(userId);

  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || product.variants.length === 0)
    throw new NotFoundException('Không tìm thấy sản phẩm hợp lệ');

  const variantId = product.variants[0].id;

  const item = await this.prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId,
      quantity: 1,
      priceSnap: 0,
    },
  });

  return { message: '✅ Đã thêm sản phẩm miễn phí vào giỏ', item };
}

  // =========================
  // ➕ Thêm sản phẩm vào giỏ
  // =========================
  @Post('items')
  async addItem(
    @Req() req: AuthRequest,
    @Body() body: AddToCartDto,
    @Query('userId') userId?: string,
  ) {
    const resolvedId = this.resolveUserId(req, userId);
    return this.cartService.addItem(resolvedId, body.variantId, body.quantity);
  }

  // =========================
  // 🔄 Cập nhật số lượng
  // =========================
  @Patch('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(itemId, body.quantity);
  }

  // =========================
  // ❌ Xóa 1 sản phẩm
  // =========================
  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  // =========================
  // 🧹 Xóa toàn bộ giỏ hàng
  // =========================
  @Delete('clear')
  async clearCart(@Req() req: AuthRequest, @Query('userId') userId?: string) {
    const resolvedId = this.resolveUserId(req, userId);
    return this.cartService.clearCart(resolvedId);
  }
}

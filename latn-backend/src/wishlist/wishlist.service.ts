import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  /** 🩷 Thêm sản phẩm vào wishlist (nếu chưa có) */
  async add(dto: CreateWishlistDto) {
    const existing = await this.prisma.wishlist.findFirst({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (existing) {
      return { added: false, message: 'Sản phẩm đã có trong wishlist' };
    }

    // 🟢 Tạo wishlist mới
    const created = await this.prisma.wishlist.create({
      data: dto,
    });

    // 🔍 Lấy thông tin sản phẩm tương ứng
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        images: true,
        brand: true,
        category: true,
        variants: true,
      },
    });

    return {
      added: true,
      data: { ...created, product },
      message: 'Đã thêm vào wishlist thành công',
    };
  }

  /** ❌ Xóa sản phẩm khỏi wishlist */
  async removeByUserAndProduct(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findFirst({
      where: { userId, productId },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong wishlist');
    }

    await this.prisma.wishlist.delete({
      where: { id: existing.id },
    });

    return { deleted: true, message: 'Đã xóa khỏi wishlist' };
  }

  /** 📦 Lấy danh sách wishlist của user (kèm thông tin sản phẩm) */
  async findAll(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 🔁 Truy vấn thông tin sản phẩm song song
    const result = await Promise.all(
      items.map(async (w) => {
        const product = await this.prisma.product.findUnique({
          where: { id: w.productId },
          include: {
            images: true,
            brand: true,
            category: true,
            variants: true,
          },
        });
        return { ...w, product };
      }),
    );

    return result;
  }

  /** 🧹 Xóa toàn bộ wishlist của user */
  async clearUserWishlist(userId: string) {
    await this.prisma.wishlist.deleteMany({ where: { userId } });
    return { cleared: true };
  }
}

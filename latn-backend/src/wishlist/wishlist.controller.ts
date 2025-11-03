import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /** 🩷 Thêm vào wishlist */
  @Post()
  async add(@Body() dto: CreateWishlistDto) {
    return this.wishlistService.add(dto);
  }

  /** ❌ Xóa khỏi wishlist */
  @Delete()
  async remove(@Body() dto: CreateWishlistDto) {
    return this.wishlistService.removeByUserAndProduct(dto.userId, dto.productId);
  }

  /** 📦 Lấy danh sách wishlist của user */
  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.wishlistService.findAll(userId);
  }
}

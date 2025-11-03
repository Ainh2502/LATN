import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    const brand = await this.prisma.brand.create({ data: dto });
    return { message: '✅ Tạo thương hiệu thành công', brand };
  }

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        description: true,
        _count: { select: { products: true } },
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    const existing = await this.prisma.brand.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy thương hiệu');

    const updated = await this.prisma.brand.update({
      where: { id },
      data: dto,
    });
    return { message: '✅ Đã cập nhật thương hiệu', updated };
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');

    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Xóa tất cả sản phẩm thuộc thương hiệu này
      await tx.product.deleteMany({
        where: { brandId: id },
      });

      // 2️⃣ Xóa thương hiệu
      await tx.brand.delete({
        where: { id },
      });
    });

    return {
      message: '🗑️ Đã xóa thương hiệu và toàn bộ sản phẩm liên quan',
      deletedBrandId: id,
    };
  }
}

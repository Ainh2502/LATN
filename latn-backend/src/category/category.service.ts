import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    // 🧠 Kiểm tra trùng slug
    const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException('Slug đã tồn tại, vui lòng chọn tên khác.');
    }

    // 🧠 Kiểm tra parentId hợp lệ (nếu có)
    let parentId: string | null = null;
    if (dto.parentId) {
      const parentExists = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parentExists) {
        throw new BadRequestException('Danh mục cha không hợp lệ.');
      }
      parentId = dto.parentId;
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        parentId,
      },
    });

    return { message: '✅ Tạo danh mục thành công', category };
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy danh mục');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
      if (slugExists) throw new BadRequestException('Slug đã tồn tại.');
    }

    let parentId: string | null = null;
    if (dto.parentId) {
      const parentExists = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parentExists) throw new BadRequestException('Danh mục cha không hợp lệ.');
      parentId = dto.parentId;
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        slug: dto.slug ?? existing.slug,
        parentId,
      },
    });

    return { message: '✅ Cập nhật danh mục thành công', updated };
  }

async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    // 🧩 Hàm đệ quy tìm tất cả ID con, cháu, chắt...
    const collectChildIds = async (parentId: string): Promise<string[]> => {
      const children = await this.prisma.category.findMany({
        where: { parentId },
        select: { id: true },
      });
      let allIds: string[] = [];
      for (const child of children) {
        allIds.push(child.id);
        const subChildren = await collectChildIds(child.id);
        allIds = allIds.concat(subChildren);
      }
      return allIds;
    };

    const childIds = await collectChildIds(id);
    const allIds = [id, ...childIds]; // tất cả danh mục cần xóa

    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Xóa sản phẩm thuộc tất cả danh mục (cha + con)
      await tx.product.deleteMany({
        where: { categoryId: { in: allIds } },
      });

      // 2️⃣ Xóa toàn bộ danh mục con trước
      await tx.category.deleteMany({
        where: { id: { in: childIds } },
      });

      // 3️⃣ Xóa danh mục chính
      await tx.category.delete({
        where: { id },
      });
    });

    return {
      message: '🗑️ Đã xóa danh mục, các danh mục con và sản phẩm bên trong',
      deletedIds: allIds,
    };
  }
}

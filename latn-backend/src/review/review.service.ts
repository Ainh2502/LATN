import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

type ListQuery = {
  page?: number;
  pageSize?: number;
  productId?: string;
  userId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  rating?: number;
};

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /** 🟢 Tạo review mới */
  async create(dto: CreateReviewDto, currentUserId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new BadRequestException('Sản phẩm không tồn tại');

    const userId = dto.userId ?? currentUserId;
    if (!userId)
      throw new BadRequestException('Thiếu userId (JWT hoặc dto.userId)');

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        rating: dto.rating,
        title: dto.title,
        content: dto.content,
        images: dto.images ?? [],
        status: 'APPROVED', // ✅ auto duyệt
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });
  }

  /** 🔍 Danh sách review (Frontend + Admin chung) */
  async list(q: ListQuery, currentUserId?: string) {
    const page = Math.max(Number(q.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(q.pageSize ?? 10), 1), 100);

    const where: any = {
      productId: q.productId || undefined,
      userId: q.userId || undefined,
    };

    // ⭐ Lọc theo số sao
    if (q.rating && q.rating >= 1 && q.rating <= 5) {
      where.rating = q.rating;
    }

    /**
     * ⚙️ Logic hiển thị theo quyền
     * - Nếu token có role = ADMIN / STAFF → hiển thị tất cả (bỏ lọc status)
     * - Nếu là CUSTOMER → hiển thị review của họ + APPROVED
     * - Nếu chưa login → chỉ hiển thị APPROVED
     */
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
      // 🟢 Admin/Staff xem tất cả → không thêm điều kiện where.status
    } else if (currentUserId) {
      where.OR = [{ status: 'APPROVED' }, { userId: currentUserId }];
    } else {
      where.status = 'APPROVED';
    }

    // 🔽 Sắp xếp
    const orderBy:
      | { createdAt: 'asc' | 'desc' }
      | { rating: 'asc' | 'desc' } =
      q.sort === 'oldest'
        ? { createdAt: 'asc' }
        : q.sort === 'highest'
        ? { rating: 'desc' }
        : q.sort === 'lowest'
        ? { rating: 'asc' }
        : { createdAt: 'desc' };

    // 🧩 Query chính
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: { url: true, isPrimary: true },
                orderBy: { isPrimary: 'desc' },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /** 🔎 Chi tiết */
  async detail(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!review) throw new NotFoundException('Không tìm thấy review');
    return review;
  }

  /** ✏️ Cập nhật */
  async update(id: string, dto: UpdateReviewDto) {
    await this.ensureExists(id);
    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating ?? undefined,
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
        images: dto.images ?? undefined,
        status: dto.status ?? undefined,
      },
    });
  }

  /** ❌ Xóa */
  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }

  /** ✅ Duyệt */
  async approve(id: string) {
    await this.ensureExists(id);
    return this.prisma.review.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  /** 🚫 Từ chối */
  async reject(id: string) {
    await this.ensureExists(id);
    return this.prisma.review.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  /** 📊 Summary (chỉ tính review APPROVED) */
async summaryByProduct(productId: string) {
  const where = { productId, status: 'APPROVED' as const };

  const [agg, groupedRaw] = await this.prisma.$transaction([
    this.prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { rating: true },
    }),
    this.prisma.review.groupBy({
      by: ['rating'] as const,
      where,
      _count: { _all: true },
      orderBy: { rating: 'asc' as const },
    }),
  ]);

  // ✅ Ép kiểu rõ ràng cho kết quả groupBy
  type GroupedRow = { rating: 1 | 2 | 3 | 4 | 5; _count: { _all: number } };
  const grouped = groupedRaw as unknown as GroupedRow[];

  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const g of grouped) {
    // ⚠️ phải là _all (có gạch dưới), không phải all
    breakdown[g.rating] = g._count._all ?? 0;
  }

  return {
    productId,
    average: Number(agg._avg.rating ?? 0).toFixed(2),
    count: agg._count.rating ?? 0,
    breakdown,
  };
}


  /** 🧩 Kiểm tra tồn tại */
  private async ensureExists(id: string) {
    const exists = await this.prisma.review.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy review');
  }
}

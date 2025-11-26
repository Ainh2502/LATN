import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🟢 Lấy tất cả sản phẩm (hiển thị danh sách)
   * Bao gồm brand, category, ảnh, variant và áp dụng khuyến mãi tối ưu
   */
  async findAll(query?: any) {
    const { name, category, brand, color, size, minPrice, maxPrice, sortOrder } = query || {};

    const where: any = { status: 'PUBLISHED' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (brand) where.brand = { name: { contains: brand, mode: 'insensitive' } };
    if (category) where.category = { name: { contains: category, mode: 'insensitive' } };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: true,
        variants: true,
      },
      orderBy: { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' },
    });

    // ⚡ Lọc theo màu/size nếu có
    const filtered = products.filter((p) => {
      if (!color && !size) return true;
      const variants = p.variants || [];
      return variants.some((v) => {
        const opt =
          typeof v.optionJson === 'string'
            ? JSON.parse(v.optionJson)
            : v.optionJson;
        const colorOk = color
          ? (opt?.color?.toLowerCase() ?? '').includes(color.toLowerCase())
          : true;
        const sizeOk = size
          ? (opt?.size?.toLowerCase() ?? '').includes(size.toLowerCase())
          : true;
        return colorOk && sizeOk;
      });
    });

    // 🧠 Lấy danh sách khuyến mãi còn hiệu lực
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: { status: 'ACTIVE', startAt: { lte: now }, endAt: { gte: now } },
    });

    // 🎯 Áp dụng khuyến mãi tối ưu (bao gồm khuyến mãi toàn bộ sản phẩm)
    const result = filtered.map((p) => {
      const compareAt = Number(p.compareAt ?? 0);
      const canApplyPromo = !compareAt || compareAt <= 0 || compareAt <= p.price;

      const applicablePromos = promotions.filter((pr) => {
        const s = (pr.scopeJson || {}) as any;

        // ✅ Nếu scopeJson trống hoặc null → khuyến mãi toàn bộ sản phẩm
        if (Object.keys(s).length === 0) return true;

        const brandOk =
          !s.brandIds || s.brandIds.length === 0 || s.brandIds.includes(p.brandId);
        const catOk =
          !s.categoryIds || s.categoryIds.length === 0 || s.categoryIds.includes(p.categoryId);
        const minOk = !s.minPrice || p.price >= s.minPrice;
        const maxOk = !s.maxPrice || p.price <= s.maxPrice;
        return brandOk && catOk && minOk && maxOk;
      });

      let bestPromo: any = null;
      let bestFinalPrice = p.price;

      if (canApplyPromo && applicablePromos.length > 0) {
        for (const promo of applicablePromos) {
          let testPrice = p.price;
          if (promo.type === 'percentage')
            testPrice = Math.round(p.price * (1 - promo.value / 100));
          else if (promo.type === 'fixed')
            testPrice = Math.max(0, p.price - promo.value);

          if (testPrice < bestFinalPrice) {
            bestFinalPrice = testPrice;
            bestPromo = promo;
          }
        }
      }

      return {
        ...p,
        finalPrice: bestPromo ? bestFinalPrice : p.price,
        appliedPromotion: bestPromo
          ? { id: bestPromo.id, name: bestPromo.name, type: bestPromo.type, value: bestPromo.value }
          : null,
      };
    });

    return result;
  }

  /**
   * 🟢 Lấy chi tiết 1 sản phẩm (bao gồm variant, review, và khuyến mãi)
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: { isPrimary: 'desc' },
        },
        variants: { include: { inventory: true } },
        Review: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: { status: 'ACTIVE', startAt: { lte: now }, endAt: { gte: now } },
    });

    const compareAt = Number(product.compareAt ?? 0);
    const canApplyPromo = !compareAt || compareAt <= 0 || compareAt <= product.price;

    // 🎯 Lọc khuyến mãi phù hợp (bao gồm toàn shop)
    const applicablePromos = promotions.filter((pr) => {
      const s = (pr.scopeJson || {}) as any;
      if (Object.keys(s).length === 0) return true; // toàn shop

      const brandOk =
        !s.brandIds || s.brandIds.length === 0 || s.brandIds.includes(product.brandId);
      const catOk =
        !s.categoryIds || s.categoryIds.length === 0 || s.categoryIds.includes(product.categoryId);
      const minOk = !s.minPrice || product.price >= s.minPrice;
      const maxOk = !s.maxPrice || product.price <= s.maxPrice;
      return brandOk && catOk && minOk && maxOk;
    });

    let bestPromo: any = null;
    let bestFinalPrice = product.price;

    if (canApplyPromo && applicablePromos.length > 0) {
      for (const promo of applicablePromos) {
        let testPrice = product.price;
        if (promo.type === 'percentage')
          testPrice = Math.round(product.price * (1 - promo.value / 100));
        else if (promo.type === 'fixed')
          testPrice = Math.max(0, product.price - promo.value);

        if (testPrice < bestFinalPrice) {
          bestFinalPrice = testPrice;
          bestPromo = promo;
        }
      }
    }

    return {
      ...product,
      finalPrice: bestPromo ? bestFinalPrice : product.price,
      appliedPromotion: bestPromo
        ? { id: bestPromo.id, name: bestPromo.name, type: bestPromo.type, value: bestPromo.value }
        : null,
    };
  }

  // 🟢 CRUD và helper functions giữ nguyên
  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        price: dto.price,
        compareAt: dto.compareAt,
        shortDesc: dto.shortDesc,
        longDesc: dto.longDesc,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        status: dto.status,
      },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm để cập nhật');

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        slug: dto.slug ?? existing.slug,
        price: dto.price ?? existing.price,
        compareAt: dto.compareAt ?? existing.compareAt,
        shortDesc: dto.shortDesc ?? existing.shortDesc,
        longDesc: dto.longDesc ?? existing.longDesc,
        brandId: dto.brandId ?? existing.brandId,
        categoryId: dto.categoryId ?? existing.categoryId,
        status: dto.status ?? existing.status,
      },
      include: { brand: true, category: true, images: true },
    });
  }

  async remove(id: string) {
    await this.prisma.productImage.deleteMany({ where: { productId: id } });
    await this.prisma.productVariant.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }

  async getNewest() {
    return this.prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { brand: true, category: true, images: true, variants: true },
    });
  }

  async getTopPopular() {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: { not: 'FAILED' },
          fulfillmentStatus: { not: 'CANCELLED' },
        },
      },
      select: { productId: true, qty: true },
    });

    if (orderItems.length === 0) return [];

    const quantityMap = new Map<string, number>();
    for (const item of orderItems) {
      const prev = quantityMap.get(item.productId) ?? 0;
      quantityMap.set(item.productId, prev + item.qty);
    }

    const sorted = Array.from(quantityMap.entries()).sort((a, b) => b[1] - a[1]);
    const topIds = sorted.slice(0, 4).map(([id]) => id);

    const products = await this.prisma.product.findMany({
      where: { id: { in: topIds }, status: 'PUBLISHED' },
      include: { brand: true, category: true, images: true, variants: true },
    });

    return topIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  }

  async getUniqueColors() {
    const variants = await this.prisma.productVariant.findMany({
      select: { optionJson: true },
    });
    const colors: string[] = [];
    for (const v of variants) {
      if (!v.optionJson) continue;
      let data: any;
      try {
        data =
          typeof v.optionJson === 'string'
            ? JSON.parse(v.optionJson)
            : v.optionJson;
      } catch {
        continue;
      }
      const color = data?.color || data?.Color || data?.mau || data?.Màu;
      if (color) colors.push(color.trim());
    }
    const uniqueColors = Array.from(new Set(colors.map((c) => c.toLowerCase()))).map(
      (lower) => colors.find((c) => c.toLowerCase() === lower)!,
    );
    return uniqueColors.sort();
  }

  async getUniqueSizes() {
    const variants = await this.prisma.productVariant.findMany({
      select: { optionJson: true },
    });
    const sizes: string[] = [];
    for (const v of variants) {
      if (!v.optionJson) continue;
      let data: any;
      try {
        data =
          typeof v.optionJson === 'string'
            ? JSON.parse(v.optionJson)
            : v.optionJson;
      } catch {
        continue;
      }
      const size = data?.size || data?.Size || data?.kichthuoc || data?.KíchThước;
      if (size) sizes.push(size.trim());
    }
    const uniqueSizes = Array.from(new Set(sizes.map((s) => s.toLowerCase()))).map(
      (lower) => sizes.find((s) => s.toLowerCase() === lower)!,
    );
    return uniqueSizes.sort();
  }
}

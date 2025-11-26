import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Prisma } from '@prisma/client'; // ✅ thêm dòng này

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async getAllAttributes() {
    const variants = await this.prisma.productVariant.findMany({
      select: { optionJson: true },
      where: {
        optionJson: { not: Prisma.JsonNull }, // ✅ FIX: dùng Prisma.JsonNull thay vì null
      },
    });

    const attrMap: Record<string, Set<string>> = {};

    for (const v of variants) {
      const opt = v.optionJson as Record<string, any> | null;
      if (!opt) continue;

      for (const key of Object.keys(opt)) {
        if (!attrMap[key]) attrMap[key] = new Set();
        attrMap[key].add(opt[key]);
      }
    }

    return Object.entries(attrMap).map(([key, values]) => ({
      name: key,
      values: Array.from(values),
    }));
  }

  async filterByAttribute(key: string, value: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        optionJson: {
          path: [key],
          equals: value,
        },
      },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true },
        },
      },
    });

    return variants.map(v => ({
      variantId: v.id,
      sku: v.sku,
      optionJson: v.optionJson,
      product: v.product,
    }));
  }
}

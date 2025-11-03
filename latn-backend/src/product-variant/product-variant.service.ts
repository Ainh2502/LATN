import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async listByProduct(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      include: { inventory: true },
      orderBy: { sku: 'asc' },
    });
  }

  async findOne(id: string) {
    const v = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { inventory: true, product: { select: { id: true, name: true } } },
    });
    if (!v) throw new NotFoundException('Variant not found');
    return v;
  }

  async create(dto: CreateVariantDto) {
    const data: Prisma.ProductVariantCreateInput = {
      sku: dto.sku,
      product: { connect: { id: dto.productId } },
      optionJson: dto.optionJson ?? Prisma.JsonNull,
      priceOverride: dto.priceOverride ?? null,
      weight: dto.weight ?? null,
      length: dto.length ?? null,
      width: dto.width ?? null,
      height: dto.height ?? null,
    };

    const created = await this.prisma.productVariant.create({ data });

    // Create inventory immediately if provided
    if (dto.inventory) {
      await this.prisma.inventory.create({
        data: {
          variant: { connect: { id: created.id } },
          stockOnHand: dto.inventory.stockOnHand ?? 0,
          stockReserved: dto.inventory.stockReserved ?? 0,
        },
      });
    }

    return this.findOne(created.id);
  }

  async update(id: string, dto: UpdateVariantDto) {
    // ensure exists
    await this.findOne(id);

    await this.prisma.productVariant.update({
      where: { id },
      data: {
        sku: dto.sku ?? undefined,
        optionJson: dto.optionJson === undefined ? undefined : (dto.optionJson ?? Prisma.JsonNull),
        priceOverride: dto.priceOverride ?? undefined,
        weight: dto.weight ?? undefined,
        length: dto.length ?? undefined,
        width: dto.width ?? undefined,
        height: dto.height ?? undefined,
        product: dto.productId ? { connect: { id: dto.productId } } : undefined,
      },
    });

    if (dto.inventory) {
      // upsert inventory by unique variantId
      await this.prisma.inventory.upsert({
        where: { variantId: id },
        create: {
          variant: { connect: { id } },
          stockOnHand: dto.inventory.stockOnHand ?? 0,
          stockReserved: dto.inventory.stockReserved ?? 0,
        },
        update: {
          stockOnHand: dto.inventory.stockOnHand ?? undefined,
          stockReserved: dto.inventory.stockReserved ?? undefined,
        },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // delete inventory first due to FK
    await this.prisma.inventory.deleteMany({ where: { variantId: id } });
    await this.prisma.productVariant.delete({ where: { id } });
    return { id, deleted: true };
  }
}

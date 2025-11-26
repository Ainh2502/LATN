import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.inventory.findMany({
      include: { variant: { select: { id: true, sku: true, productId: true } } },
    });
  }

  get(variantId: string) {
    return this.prisma.inventory.findUnique({ where: { variantId } });
  }

  async update(variantId: string, data: any) {
    return this.prisma.inventory.upsert({
      where: { variantId },
      create: { variant: { connect: { id: variantId } }, ...data },
      update: data,
    });
  }
}

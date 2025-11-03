import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBannerDto) {
    // ép kiểu DTO sang Prisma.BannerCreateInput
    return this.prisma.banner.create({
      data: {
        title: data.title ?? '',
        imageUrl: data.imageUrl ?? '',
        linkUrl: data.linkUrl ?? null,
        position: data.position ?? null,
        visibleFrom: data.visibleFrom ? new Date(data.visibleFrom) : null,
        visibleTo: data.visibleTo ? new Date(data.visibleTo) : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { visibleFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.banner.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl ?? null,
        position: data.position ?? null,
        visibleFrom: data.visibleFrom ? new Date(data.visibleFrom) : null,
        visibleTo: data.visibleTo ? new Date(data.visibleTo) : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.page.findMany({ orderBy: { slug: 'asc' } });
  }

  getBySlug(slug: string) {
    return this.prisma.page.findUnique({ where: { slug } });
  }

  create(data: any) {
    return this.prisma.page.create({ data });
  }

  update(slug: string, data: any) {
    return this.prisma.page.update({ where: { slug }, data });
  }

  remove(slug: string) {
    return this.prisma.page.delete({ where: { slug } });
  }
}

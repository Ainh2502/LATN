import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { PrismaService } from '../config/prisma.service';
import { MinioModule } from '../utils/minio/minio.module'; // ✅ import MinioModule

@Module({
    imports: [MinioModule], // ✅ BẮT BUỘC để MinioService khả dụng
  controllers: [BannerController],
  providers: [BannerService, PrismaService],
})
export class BannerModule {}

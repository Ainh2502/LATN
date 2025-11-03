import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../config/prisma.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import * as fs from 'fs';
import { MinioService } from '../utils/minio/minio.service'; // ✅ import MinioService
import { ApiTags } from '@nestjs/swagger';
@ApiTags('product')

@Controller('product/:productId/images')
export class ProductImageController {
constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService, // ✅ inject service vào constructor
  ) {}
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
async uploadFiles(
  @Param('productId') productId: string,
  @UploadedFiles() files: Express.Multer.File[],
) {
  const urls: string[] = [];

  for (const file of files) {
    const url = await this.minioService.uploadFile(file);
    urls.push(url);
  }

  // Lưu vào DB
  await this.prisma.productImage.createMany({
    data: urls.map((url) => ({
      productId,
      url,
    })),
  });

  return { message: '✅ Uploaded successfully', urls };
}



  // 🟢 Thêm ảnh từ URL
  @Post('add-link')
  async addImagesFromLinks(
    @Param('productId') productId: string,
    @Body() body: { urls: string[] },
  ) {
    if (!body.urls || body.urls.length === 0) {
      throw new NotFoundException('Danh sách URL trống.');
    }

    const images = await Promise.all(
      body.urls.map((url) =>
        this.prisma.productImage.create({
          data: { productId, url, isPrimary: false },
        }),
      ),
    );

    return { message: '✅ Đã thêm ảnh từ link', images };
  }

  // 🔴 Xóa 1 ảnh cụ thể
  @Delete(':imageId')
  async deleteImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Không tìm thấy ảnh.');
    }

    // 🔹 Xóa file vật lý nếu là file upload cục bộ
    if (image.url.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });

    // Nếu ảnh bị xóa là ảnh chính → đặt ảnh đầu tiên còn lại làm isPrimary
    const remaining = await this.prisma.productImage.findMany({
      where: { productId },
  orderBy: { id: 'asc' }, // ✅ thay createdAt thành id
    });
    if (image.isPrimary && remaining.length > 0) {
      await this.prisma.productImage.update({
        where: { id: remaining[0].id },
        data: { isPrimary: true },
      });
    }

    return { message: '🗑️ Đã xóa ảnh thành công.' };
  }

  // 🟡 Đặt ảnh làm ảnh chính (isPrimary = true)
  @Patch(':imageId/set-primary')
  async setPrimary(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Không tìm thấy ảnh.');
    }

    // Reset toàn bộ ảnh khác về false
    await this.prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    // Đặt ảnh này là chính
    await this.prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    return { message: '⭐ Ảnh này đã được đặt làm ảnh chính.' };
  }
}

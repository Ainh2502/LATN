import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '../config/prisma.module';
import { ProductImageController } from './product-image.controller';
import { MinioModule } from '../utils/minio/minio.module'; // ✅ import

@Module({
  imports: [PrismaModule, MinioModule], // ✅ thêm MinioModule
  controllers: [ProductController, ProductImageController],
  providers: [ProductService],
})
export class ProductModule {}

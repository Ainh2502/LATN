import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';

@Module({
  imports: [ConfigModule],
  providers: [MinioService],
  exports: [MinioService], // 👈 export để module khác có thể dùng
})
export class MinioModule {}

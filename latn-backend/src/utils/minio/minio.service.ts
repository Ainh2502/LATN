import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import * as path from 'path';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly bucket: string;
  private readonly client: Client;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor(private readonly config: ConfigService) {
    // ✅ Đọc cấu hình từ .env
    this.endpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    this.port = parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10);
    this.useSSL = this.config.get<string>('MINIO_USE_SSL', 'false') === 'true';
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'latn-images');

    // ✅ Khởi tạo MinIO client
    this.client = new Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', 'admin'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', 'admin123'),
    });

    // ✅ Kiểm tra và tạo bucket nếu chưa có
    this.ensureBucket();
  }

  /**
   * 🪣 Đảm bảo bucket tồn tại, nếu chưa có thì tạo + bật public access
   */
  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);

      if (!exists) {
        await this.client.makeBucket(this.bucket, '');
        this.logger.log(`🪣 Đã tạo mới bucket: ${this.bucket}`);

        // 🌍 Tự động bật quyền public access
        await this.setPublicAccess();
      } else {
        this.logger.log(`✅ Bucket '${this.bucket}' sẵn sàng`);
        // Kiểm tra lại quyền public access (phòng trường hợp bị reset)
        await this.setPublicAccess();
      }
    } catch (error: any) {
      if (
        error.code === 'BucketAlreadyOwnedByYou' ||
        error.message?.includes('already own it')
      ) {
        this.logger.log(`✅ Bucket '${this.bucket}' đã tồn tại, bỏ qua tạo mới.`);
        await this.setPublicAccess();
      } else {
        this.logger.error(`❌ Lỗi khi kiểm tra/tạo bucket '${this.bucket}':`, error.message);
      }
    }
  }

  /**
   * 🌍 Bật quyền public access cho bucket
   */
  private async setPublicAccess() {
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };

      await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
      this.logger.log(`🌍 Đã bật public access cho bucket: ${this.bucket}`);
    } catch (error: any) {
      this.logger.error(`⚠️ Lỗi khi bật public access: ${error.message}`);
    }
  }

  /**
   * 📤 Upload file (từ multer)
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}${fileExt}`;

      await this.client.putObject(this.bucket, fileName, file.buffer);

      const url = `http://${this.endpoint}:${this.port}/${this.bucket}/${fileName}`;
      this.logger.log(`✅ Uploaded file: ${fileName}`);
      return url;
    } catch (error: any) {
      this.logger.error('❌ Lỗi upload MinIO:', error.message);
      throw error;
    }
  }

  /**
   * 🗑️ Xóa file trên MinIO
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const objectName = fileUrl.split(`/${this.bucket}/`)[1];
      if (!objectName) return;

      await this.client.removeObject(this.bucket, objectName);
      this.logger.log(`🗑️ Đã xóa ảnh: ${objectName}`);
    } catch (error: any) {
      this.logger.error('❌ Lỗi khi xóa file trên MinIO:', error.message);
      throw error;
    }
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import { join } from 'path';

// 🧩 Tự động tạo folder lưu ảnh nếu chưa có
const uploadDir = join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Bật CORS toàn cục cho client, admin, và domain
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://192.168.102.67:5173',
      'http://latn.site:5173',
      'https://latn.site',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ✅ Middleware xử lý OPTIONS thủ công (fix lỗi preflight)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      console.log('🔥 OPTIONS request received for', req.url);
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      );
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.sendStatus(204);
    }
    next();
  });

  // ✅ ValidationPipe: tự động transform + loại field dư thừa
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LATN Web Admin API')
    .setDescription(
      '📘 API tài liệu hệ thống quản trị LATN – bao gồm các module: auth, users, products, orders, promotions, analytics, payment (VNPAY), v.v.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 🔐 Giữ token sau reload
      docExpansion: 'list',       // 📂 Mở sẵn các nhóm endpoint
      tagsSorter: 'alpha',        // 🔤 Sắp xếp tag theo tên
      operationsSorter: 'method', // ⚙️ Sắp xếp theo HTTP method
      defaultModelsExpandDepth: -1, // Ẩn phần model
    },
    customSiteTitle: 'LATN API Docs',
    customCss: `
      .topbar-wrapper img { content:url('https://nestjs.com/img/logo-small.svg'); width:40px; }
      .swagger-ui .topbar { background-color: #1a202c; }
      .swagger-ui .info h2 { font-weight: 600; }
    `,
  });

  // ✅ Cho phép truy cập từ toàn bộ network (phục vụ LAN hoặc deploy)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📘 Swagger UI: http://localhost:${port}/docs`);
}

bootstrap();

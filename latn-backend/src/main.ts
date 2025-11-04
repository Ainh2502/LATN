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

  // ✅ Bật CORS cho toàn hệ thống (Admin + Client + Mobile + EC2)
  app.enableCors({
    origin: [
      // Local development
      'http://localhost:5173', // Admin local
      'http://localhost:5174', // Client local
      'http://localhost:5175', // Mobile web local
      'http://192.168.102.67:5173',

 
    
	// 🌎 Production domains (EC2)
    'https://latn.site',        // Client live
    'https://admin.latn.site',  // Admin live
    'https://api.latn.site',   // 🌎 Production domains (EC2)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ✅ Middleware thủ công xử lý preflight OPTIONS
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      console.log('🔥 OPTIONS request received for', req.url);
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.sendStatus(204);
    }
    next();
  });

  // ✅ Validation pipes (lọc field dư, tự transform DTO)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LATN Web Admin API')
    .setDescription(
      '📘 API tài liệu hệ thống LATN – bao gồm các module: Auth, Users, Products, Orders, Promotions, Analytics, v.v.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      defaultModelsExpandDepth: -1,
    },
    customSiteTitle: 'LATN API Docs',
    customCss: `
      .topbar-wrapper img { content:url('https://nestjs.com/img/logo-small.svg'); width:40px; }
      .swagger-ui .topbar { background-color: #1a202c; }
      .swagger-ui .info h2 { font-weight: 600; }
    `,
  });

  // ✅ Lắng nghe tất cả địa chỉ (để EC2 hoặc LAN truy cập được)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📘 Swagger UI: http://localhost:${port}/docs`);
}

bootstrap();

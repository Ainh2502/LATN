import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from './utils/mailer/mailer.service';

@Controller()
export class AppController {
  
  /**
   * ✅ Route gốc kiểm tra trạng thái backend
   * Dùng để xác nhận API đang chạy ổn định và định hướng tài liệu
   */
  @Get()
  
  @ApiOperation({ summary: 'Kiểm tra trạng thái hệ thống & danh sách module API' })
  getRoot() {
    const baseUrl = 'http://localhost:3000';
    return {
      message: '✅ Web-Admin API is running successfully!',
      docs: `${baseUrl}/docs`,
      api: {
        auth: '/auth',
        users: '/users',
        products: '/product',
        categories: '/category',
        brands: '/brand',
        orders: '/order',
        customers: '/customer',
        promotions: '/promotion',
        reviews: '/review',
        banners: '/banner',
        dashboard: '/dashboard/overview',
        cart: '/cart',
        attribute: '/attribute',
        productVariant: '/product-variant',
        // 🧩 Các module mở rộng
        address: '/address',
        inventory: '/inventory',
        payment: '/payment',
        shipment: '/shipment',
        page: '/page',
        coupon: '/coupon',
        orderItem: '/order-item',
        analytics: '/analytics',
        mailer: '/mailer',
      },
      status: 'OK',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

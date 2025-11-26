import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WishlistModule } from './wishlist/wishlist.module';

// ===== Feature Modules =====
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { OrderModule } from './order/order.module';
import { CustomerModule } from './customer/customer.module';
import { PromotionModule } from './promotion/promotion.module';
import { ReviewModule } from './review/review.module';
import { BannerModule } from './banner/banner.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CartModule } from './cart/cart.module';
import { AttributeModule } from './attribute/attribute.module';
import { ProductVariantModule } from './product-variant/product-variant.module';

// ===== New Modules =====
import { AddressModule } from './address/address.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentModule } from './payment/payment.module';
import { ShipmentModule } from './shipment/shipment.module';
import { PageModule } from './page/page.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderItemModule } from './order-item/order-item.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MailModule } from './utils/mailer/mailer.module';

// ===== Root Controller =====
import { AppController } from './app.controller';
import { UserCouponModule } from './user-coupon/user-coupon.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    // ===== Global Config =====
    ConfigModule.forRoot({ isGlobal: true }),

    // ===== Database (Prisma ORM) =====
    PrismaModule,

    // ===== Feature Modules =====
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    BrandModule,
    OrderModule,
    CustomerModule,
    PromotionModule,
    ReviewModule,
    BannerModule,
    DashboardModule,
    CartModule,
    AttributeModule,
    ProductVariantModule,
    
WishlistModule,
    // ===== Newly Added =====
    AddressModule,
    InventoryModule,
    PaymentModule,
    ShipmentModule,
    PageModule,
    CouponModule,
    OrderItemModule,
    AnalyticsModule,
    MailModule,
        PromotionModule,
            UserCouponModule,
            ReportModule,


    // ===== Static Assets =====
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      exclude: [
        '/docs*',
        '/auth*',
        '/users*',
        '/dashboard*',
        '/product*',
        '/order*',
        '/brand*',
        '/category*',
        '/banner*',
        '/promotion*',
        '/review*',
        '/cart*',
        '/attribute*',
        '/product-variant*',
        // 🧩 exclude route mới
        
        '/address*',
        '/inventory*',
        '/payment*',
        '/shipment*',
        '/page*',
        '/coupon*',
        '/order-item*',
        '/analytics*',
        '/mailer*',
      ],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}

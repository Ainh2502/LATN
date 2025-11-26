/**
 * prisma/seed.ts — Full dataset for Ái Anh Store
 * Run: npx prisma migrate reset
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seeding dữ liệu cho Ái Anh Store...');

  // 1️⃣ ADMIN & USERS
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'aianh@gmail.com' },
    update: {},
    create: {
      email: 'aianh@gmail.com',
      passwordHash,
      name: 'Admin Ái Anh',
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.createMany({
    data: [
      { email: 'staff1@aianhstore.vn', passwordHash, name: 'Nhân viên 1', role: 'STAFF' },
      { email: 'staff2@aianhstore.vn', passwordHash, name: 'Nhân viên 2', role: 'STAFF' },
    ],
  });

  const customers = [];
  const names = [
    'Nguyễn Minh Tâm',
    'Lê Thanh Huyền',
    'Trần Quang Dũng',
    'Phạm Thị Hương',
    'Hoàng Gia Bảo',
    'Đỗ Thị Lan Anh',
    'Lý Tuấn Kiệt',
    'Võ Hoài Nam',
    'Ngô Bảo Châu',
    'Bùi Thảo Vy',
    'Huỳnh Ngọc Khánh',
    'Đinh Đức Phát',
  ];

  for (let i = 0; i < names.length; i++) {
    const email = `customer${i + 1}@gmail.com`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: names[i],
        role: 'CUSTOMER',
      },
    });
    customers.push(user);
  }

  // 2️⃣ ADDRESSES
  for (const u of customers) {
    await prisma.address.create({
      data: {
        userId: u.id,
        recipient: u.name!,
        phone: '090' + Math.floor(1000000 + Math.random() * 8999999),
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        street: `Số ${Math.floor(Math.random() * 100)} Lê Lợi`,
        isDefault: true,
      },
    });
  }

  // 3️⃣ BRANDS
  const brandNames = [
    'Gucci',
    'Zara',
    'Uniqlo',
    'Adidas',
    'Nike',
    'H&M',
    'Levis',
    'Casio',
    'Charles & Keith',
    'Owen',
    'Lacoste',
    'New Balance',
    'Puma',
    'Dior',
    'Vans',
  ];

  const brands = await Promise.all(
    brandNames.map((name, i) =>
      prisma.brand.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/ /g, '-'),
          email: `${name.toLowerCase().replace(/ /g, '')}@aianhstore.vn`,
          phone: '090' + Math.floor(1000000 + Math.random() * 8999999),
          description: `Thương hiệu ${name} nổi tiếng với phong cách thời trang hiện đại.`,
        },
      })
    )
  );

  // 4️⃣ CATEGORIES
  const catNames = [
    'Áo sơ mi',
    'Áo thun',
    'Áo khoác',
    'Quần jeans',
    'Quần tây',
    'Váy liền',
    'Giày sneaker',
    'Giày cao gót',
    'Túi xách',
    'Phụ kiện',
    'Đồng hồ',
    'Kính mắt',
    'Mũ thời trang',
    'Áo vest',
    'Đầm dạ hội',
  ];

  const categories = await Promise.all(
    catNames.map((name) =>
      prisma.category.create({ data: { name, slug: name.toLowerCase().replace(/ /g, '-') } })
    )
  );

  // 5️⃣ PRODUCTS (20 sản phẩm với ảnh thật)
  const productSamples = [
    {
      name: 'Áo sơ mi trắng Uniqlo',
      brand: 'Uniqlo',
      category: 'Áo sơ mi',
      price: 390000,
      compareAt: 450000,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600',
      ],
    },
    {
      name: 'Quần jeans xanh Levis',
      brand: 'Levis',
      category: 'Quần jeans',
      price: 850000,
      compareAt: 950000,
      images: [
        'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600',
        'https://underness.com/wp-content/uploads/2024/06/kiotviet_aa5ea36fbbfa9cdab876eda71167f5c6.jpg',
      ],
    },
    {
      name: 'Váy hoa nữ Zara',
      brand: 'Zara',
      category: 'Váy liền',
      price: 1200000,
      compareAt: 1450000,
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAcievtXZbEphMeUa-9O4hO0k536REDlmkvw&s',
        'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600',
      ],
    },
    {
      name: 'Giày sneaker Adidas Ultraboost',
      brand: 'Adidas',
      category: 'Giày sneaker',
      price: 3200000,
      compareAt: 3500000,
      images: [
        'https://kingshoes.vn/data/upload/media/gia%CC%80y-adidas-ultraboost-1.0-limited-reflective-aq5561-king-shoes-sneaker-real-hcm-6.jpg',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600',
      ],
    },
    {
      name: 'Túi xách nữ Gucci Marmont',
      brand: 'Gucci',
      category: 'Túi xách',
      price: 6900000,
      compareAt: 7900000,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
      ],
    },
    {
      name: 'Áo khoác hoodie Nike',
      brand: 'Nike',
      category: 'Áo khoác',
      price: 990000,
      compareAt: 1150000,
      images: [
        'https://product.hstatic.net/1000008082/product/1111__2__be75c08015db41d49b9345ba0b0bf3a0_master.jpeg',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
      ],
    },
    {
      name: 'Đồng hồ Casio MTP-1302',
      brand: 'Casio',
      category: 'Đồng hồ',
      price: 1250000,
      compareAt: 1450000,
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      ],
    },
    {
      name: 'Áo thun basic H&M',
      brand: 'H&M',
      category: 'Áo thun',
      price: 290000,
      compareAt: 350000,
      images: [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      ],
    },
    {
      name: 'Giày cao gót nữ Charles & Keith',
      brand: 'Charles & Keith',
      category: 'Giày cao gót',
      price: 1450000,
      compareAt: 1650000,
      images: [
        'https://cdn.sablanca.vn/ImageProducts/sn0005/red/sn0005_red_1000x1000_0025850634.jpg',
        'https://cdn.sablanca.vn/ImageProducts/sn0005/red/sn0005_red_1000x1000_0025381916.jpg',
      ],
    },
    {
      name: 'Quần tây nam Owen',
      brand: 'Owen',
      category: 'Quần tây',
      price: 650000,
      compareAt: 750000,
      images: [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600',
        'https://images.unsplash.com/photo-1583002197821-b9e3b955cb3d?w=600',
      ],
    },
  ];

  const products = [];
  for (const item of productSamples) {
    const brand = brands.find((b) => b.name === item.brand)!;
    const category = categories.find((c) => c.name === item.category)!;

    const p = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.name.toLowerCase().replace(/ /g, '-'),
        price: item.price,
        compareAt: item.compareAt,
        brandId: brand.id,
        categoryId: category.id,
        shortDesc: `Sản phẩm ${item.name} thuộc bộ sưu tập mới của ${brand.name}.`,
        longDesc: `Thiết kế tinh tế, chất liệu cao cấp, phù hợp cho mọi dịp.`,
        status: 'PUBLISHED',
        images: {
          create: item.images.map((url, i) => ({ url, isPrimary: i === 0 })),
        },
       variants: {
  create: [
    { sku: `SKU-${item.name.slice(0, 3)}-M-BLACK-${Date.now()}-${Math.floor(Math.random()*1000)}`, optionJson: { size: 'M', color: 'Black' } },
    { sku: `SKU-${item.name.slice(0, 3)}-L-WHITE-${Date.now()}-${Math.floor(Math.random()*1000)}`, optionJson: { size: 'L', color: 'White' } },
  ],
},

      },
      include: { variants: true },
    });

    for (const v of p.variants) {
      await prisma.inventory.create({
        data: {
          variantId: v.id,
          stockOnHand: 50,
          stockReserved: 0,
        },
      });
    }
    products.push(p);
  }

  // 6️⃣ PROMOTIONS
  for (let i = 1; i <= 10; i++) {
    await prisma.promotion.create({
      data: {
        name: `Khuyến mãi ${i}`,
        type: i % 2 === 0 ? 'percentage' : 'fixed',
        value: i % 2 === 0 ? 10 : 50000,
        minOrderTotal: 100000,
        startAt: new Date(),
        endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        usageLimit: 100,
        status: 'ACTIVE',
      },
    });
  }

  // 7️⃣ COUPONS
  for (let i = 1; i <= 10; i++) {
    await prisma.coupon.create({
      data: {
        code: `AIAH${i}OFF`,
        type: 'fixed',
        value: 10000 * i,
        minOrderTotal: 50000,
        startAt: new Date(),
        endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        maxUses: 100,
        used: 0,
        status: 'ACTIVE',
      },
    });
  }

  // 8️⃣ ORDERS + PAYMENTS + SHIPMENTS
  for (let i = 0; i < 10; i++) {
    const c = customers[i];
    const prod = products[i % products.length];
    const address = await prisma.address.findFirst({ where: { userId: c.id } });

    const order = await prisma.order.create({
      data: {
        code: `ORD-${Date.now()}-${i}`,
        userId: c.id,
        addressId: address!.id,
        subtotal: prod.price,
        discountTotal: 0,
        shippingFee: 30000,
        taxTotal: 0,
        grandTotal: prod.price + 30000,
        paymentStatus: 'PAID',
        fulfillmentStatus: 'DELIVERED',
        items: {
          create: [
            {
              productId: prod.id,
              variantId: prod.variants[0].id,
              name: prod.name,
              sku: prod.variants[0].sku,
              price: prod.price,
              qty: 1,
              discount: 0,
              total: prod.price,
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'VNPAY',
        provider: 'VNPAY',
        amount: order.grandTotal,
        currency: 'VND',
        status: 'PAID',
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        provider: 'GHN',
        fee: 30000,
        tracking: `GHN-${order.code}`,
        status: 'DELIVERED',
      },
    });
  }

  // 9️⃣ REVIEWS
  const sampleReviews = [
    'Sản phẩm rất đẹp, chất liệu mềm mại.',
    'Đóng gói cẩn thận, giao hàng nhanh.',
    'Màu sắc giống hình, mặc rất thoải mái.',
    'Giày đi êm chân, rất hài lòng.',
    'Sẽ ủng hộ shop lần sau!',
  ];

  for (const prod of products) {
    for (let i = 0; i < 2; i++) {
      const user = customers[(i + 2) % customers.length];
      await prisma.review.create({
        data: {
          productId: prod.id,
          userId: user.id,
          rating: 4 + (i % 2),
          title: 'Đánh giá sản phẩm',
          content: sampleReviews[Math.floor(Math.random() * sampleReviews.length)],
          status: 'APPROVED',
        },
      });
    }
  }

  // 🔟 BANNERS
  for (let i = 1; i <= 10; i++) {
    await prisma.banner.create({
      data: {
        title: `Banner khuyến mãi ${i}`,
        imageUrl: `https://images.unsplash.com/photo-1556906781-9a412961c28c?w=${800 + i * 10}`,
        linkUrl: '#',
        position: `home-${i}`,
        isActive: true,
      },
    });
  }

  console.log('✅ Seeding hoàn tất cho Ái Anh Store!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

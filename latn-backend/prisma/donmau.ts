/**
 * prisma/donmau_2025.ts — Sinh đơn hàng mẫu ngẫu nhiên từ tháng 1–9 năm 2025.
 * Mỗi tháng ít nhất 10 đơn, ngày tạo nằm ngẫu nhiên trong tháng.
 * Run: npx ts-node prisma/donmau_2025.ts
 */

import { PrismaClient, PaymentStatus, FulfillmentStatus } from '@prisma/client';
const prisma = new PrismaClient();

function randomDateInMonth(year: number, month: number): Date {
  const daysInMonth = new Date(year, month, 0).getDate(); // tháng: 1–12
  const day = Math.ceil(Math.random() * daysInMonth);
  const date = new Date(year, month - 1, day);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  console.log('📦 Bắt đầu tạo đơn hàng ngẫu nhiên cho 9 tháng đầu năm 2025...');

  // Lấy dữ liệu nền
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { addresses: true },
  });

  const products = await prisma.product.findMany({
    include: { variants: true },
    take: 20, // dùng 20 sản phẩm đầu
  });

  if (customers.length === 0 || products.length === 0) {
    console.error('⚠️ Chưa có user CUSTOMER hoặc product, hãy chạy seed.ts trước.');
    process.exit(1);
  }

  const fulfillmentStatuses: FulfillmentStatus[] = [
    'DELIVERED',
    'SHIPPED',
    'PROCESSING',
    'PENDING',
    'CANCELLED',
  ];

  let totalOrders = 0;

  // Lặp qua từng tháng 1–9
  for (let month = 1; month <= 9; month++) {
    const orderCount = Math.floor(Math.random() * 10) + 10; // ngẫu nhiên 10–20 đơn
    console.log(`📅 Tháng ${month}: tạo ${orderCount} đơn...`);

    for (let i = 0; i < orderCount; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const address = customer.addresses[0];
      if (!address) continue;

      // Chọn ngẫu nhiên 1–3 sản phẩm
      const orderItems = Array.from({ length: Math.ceil(Math.random() * 3) }, () => {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        const qty = Math.ceil(Math.random() * 2);
        const price = product.price;

        return {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          sku: variant.sku,
          price,
          qty,
          discount: 0,
          total: price * qty,
        };
      });

      const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);
      const shippingFee = 30000;
      const grandTotal = subtotal + shippingFee;
      const fulfillment = fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)];
      const createdAt = randomDateInMonth(2025, month);

      // 🧾 Tạo đơn hàng
      const order = await prisma.order.create({
        data: {
          code: `ORD-${2025}${String(month).padStart(2, '0')}-${Date.now()}-${i}`,
          userId: customer.id,
          addressId: address.id,
          subtotal,
          discountTotal: 0,
          shippingFee,
          taxTotal: 0,
          grandTotal,
          paymentStatus: 'PAID',
          fulfillmentStatus: fulfillment,
          items: { create: orderItems },
          createdAt, // gán ngày tạo theo tháng
          updatedAt: createdAt,
        },
      });

      // 💳 Thanh toán
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'VNPAY',
          provider: 'VNPAY',
          amount: grandTotal,
          currency: 'VND',
          status: 'PAID',
          createdAt,
        },
      });

      // 🚚 Giao hàng
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          provider: 'GHN',
          fee: shippingFee,
          tracking: `GHN-${order.code}`,
          status: 'DELIVERED', // ✅ luôn tạo ở trạng thái DELIVERED
          createdAt,
        },
      });

      totalOrders++;
    }
  }

  console.log(`🎉 Hoàn tất — đã tạo ${totalOrders} đơn hàng mẫu từ tháng 1 đến tháng 9 năm 2025.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi tạo đơn hàng mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

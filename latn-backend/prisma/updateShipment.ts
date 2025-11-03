import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.shipment.updateMany({
    where: { status: 'IN_TRANSIT' },
    data: { status: 'DELIVERED' },
  });

  console.log(`✅ Đã cập nhật ${result.count} shipment thành DELIVERED`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi cập nhật:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

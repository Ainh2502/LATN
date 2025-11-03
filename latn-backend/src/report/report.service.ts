import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

function parseRange(from?: string, to?: string) {
  // Expect ISO yyyy-mm-dd; nếu thiếu thì undefined
  const where: { gte?: Date; lte?: Date } = {};
  if (from) where.gte = new Date(from + 'T00:00:00.000Z');
  if (to) where.lte = new Date(to + 'T23:59:59.999Z');
  return Object.keys(where).length ? where : undefined;
}

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  /** 📊 Doanh thu theo ngày / tháng / năm, có lọc khoảng ngày */
  async getRevenue(period: 'day' | 'month' | 'year', from?: string, to?: string) {
    const dateRange = parseRange(from, to);

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      select: { createdAt: true, grandTotal: true },
    });

    const grouped: Record<string, number> = {};
    for (const o of orders) {
      const d = new Date(o.createdAt);
      let key = '';
      if (period === 'day') key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      else if (period === 'month')
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      else key = `${d.getFullYear()}`;
      grouped[key] = (grouped[key] ?? 0) + Number(o.grandTotal);
    }

    return Object.entries(grouped)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
  }

  /** 🏆 Top sản phẩm bán chạy (kèm tổng doanh thu) */
  async getTopProducts(from?: string, to?: string, limit = 10) {
    const dateRange = parseRange(from, to);

    // Lấy orderItem của các đơn PAID + trong khoảng ngày
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
          ...(dateRange ? { createdAt: dateRange } : {}),
        },
      },
      select: { productId: true, qty: true, total: true },
    });

    if (items.length === 0) return [];

    // Gom nhóm theo productId
    const agg = new Map<
      string,
      { totalQty: number; totalRevenue: number }
    >();
    for (const it of items) {
      const cur = agg.get(it.productId) ?? { totalQty: 0, totalRevenue: 0 };
      cur.totalQty += Number(it.qty);
      cur.totalRevenue += Number(it.total);
      agg.set(it.productId, cur);
    }

    const productIds = Array.from(agg.keys());
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const merged = productIds.map((pid) => ({
      productId: pid,
      productName: products.find((p) => p.id === pid)?.name ?? 'Không rõ',
      totalQty: agg.get(pid)!.totalQty,
      totalRevenue: agg.get(pid)!.totalRevenue,
    }));

    return merged
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, limit);
  }
/** 🧾 Doanh thu & số lượng của toàn bộ sản phẩm */
async getAllProductSales(from?: string, to?: string) {
  const dateRange = parseRange(from, to);

  // Lấy toàn bộ sản phẩm
  const products = await this.prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Lấy orderItem của các đơn hàng đã thanh toán
  const items = await this.prisma.orderItem.findMany({
    where: {
      order: {
        paymentStatus: 'PAID',
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
    },
    select: { productId: true, qty: true, total: true },
  });

  // Gom tổng doanh thu và số lượng theo productId
  const map = new Map<string, { totalQty: number; totalRevenue: number }>();
  for (const it of items) {
    const cur = map.get(it.productId) ?? { totalQty: 0, totalRevenue: 0 };
    cur.totalQty += Number(it.qty);
    cur.totalRevenue += Number(it.total);
    map.set(it.productId, cur);
  }

  // Gộp vào danh sách sản phẩm
  return products.map((p) => ({
    productId: p.id,
    productName: p.name,
    totalQty: map.get(p.id)?.totalQty ?? 0,
    totalRevenue: map.get(p.id)?.totalRevenue ?? 0,
  }));
}
/** 📈 So sánh doanh thu giữa nhiều tháng trong năm hiện tại */
async compareMonths(months: string) {
  const monthList = (months ?? '')
    .split(',')
    .map((m) => parseInt(m.trim()))
    .filter((m) => !isNaN(m) && m >= 1 && m <= 12);

  const nowYear = new Date().getFullYear();
  const results: any[] = [];

  for (const m of monthList) {
    const start = new Date(nowYear, m - 1, 1);
    const end = new Date(nowYear, m, 0, 23, 59, 59);

    const data = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: start, lte: end },
      },
      _sum: { grandTotal: true },
    });

    const daily = new Map<number, number>();
    for (const d of data) {
      const day = new Date(d.createdAt).getDate();
      daily.set(day, (daily.get(day) ?? 0) + Number(d._sum.grandTotal ?? 0));
    }

    // convert thành array cho biểu đồ
    const daysInMonth = new Date(nowYear, m, 0).getDate();
    const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      total: daily.get(i + 1) ?? 0,
    }));

    results.push({ month: m, data: chartData });
  }

  return results;
}

 /** 📦 Danh sách tồn kho thấp (ngưỡng tuỳ chọn) + hiển thị variant */
async getLowStock(threshold = 20) {
  const inv = await this.prisma.inventory.findMany({
    where: { stockOnHand: { lt: threshold } },
    include: {
      variant: {
        include: {
          product: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { stockOnHand: 'asc' },
    take: 100,
  });

  return inv.map((i) => {
    let variantDesc = '';
    if (i.variant.optionJson) {
      try {
        const opts = i.variant.optionJson as Record<string, string>;
        variantDesc = Object.entries(opts)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' / ');
      } catch {
        variantDesc = '';
      }
    }

    return {
      variantId: i.variantId,
      productId: i.variant.product.id,
      productName: i.variant.product.name,
      variantDesc: variantDesc || '(Biến thể)',
      stockOnHand: i.stockOnHand,
    };
  });
}

  /** 🏷️ Doanh thu theo Thương hiệu */
  async revenueByBrand(from?: string, to?: string) {
    const dateRange = parseRange(from, to);

    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
          ...(dateRange ? { createdAt: dateRange } : {}),
        },
      },
      select: { productId: true, total: true },
    });

    if (items.length === 0) return [];

    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, brand: { select: { name: true } } },
    });

    const byBrand: Record<string, number> = {};
    for (const it of items) {
      const brand =
        products.find((p) => p.id === it.productId)?.brand?.name ?? 'Khác';
      byBrand[brand] = (byBrand[brand] ?? 0) + Number(it.total);
    }

    return Object.entries(byBrand)
      .map(([brand, total]) => ({ brand, total }))
      .sort((a, b) => b.total - a.total);
  }
/** 💰 Tổng doanh thu toàn shop (chỉ tính đơn PAID) */
async getTotalRevenue() {
  const res = await this.prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { grandTotal: true },
  });
  return { totalRevenue: Number(res._sum.grandTotal ?? 0) };
}

  /** 🗂️ Doanh thu theo Danh mục */
  async revenueByCategory(from?: string, to?: string) {
    const dateRange = parseRange(from, to);

    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
          ...(dateRange ? { createdAt: dateRange } : {}),
        },
      },
      select: { productId: true, total: true },
    });

    if (items.length === 0) return [];

    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: { select: { name: true } } },
    });

    const byCat: Record<string, number> = {};
    for (const it of items) {
      const cat =
        products.find((p) => p.id === it.productId)?.category?.name ?? 'Khác';
      byCat[cat] = (byCat[cat] ?? 0) + Number(it.total);
    }

    return Object.entries(byCat)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }
}

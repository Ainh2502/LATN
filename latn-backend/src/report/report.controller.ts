import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /** 📊 Doanh thu theo thời gian (ngày/tháng/năm) + lọc khoảng ngày */
  @Get('revenue')
  @ApiOperation({ summary: 'Thống kê doanh thu theo ngày / tháng / năm, có lọc từ ngày - đến ngày' })
  async getRevenue(
    @Query('period') period: 'day' | 'month' | 'year' = 'month',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportService.getRevenue(period, from, to);
  }
@Get('total-revenue')
@ApiOperation({ summary: 'Tổng doanh thu toàn shop (chỉ tính đơn PAID)' })
async getTotalRevenue() {
  return this.reportService.getTotalRevenue();
}

  /** 🏆 Top sản phẩm bán chạy (lọc theo khoảng ngày, giới hạn top) */
  @Get('top-products')
  @ApiOperation({ summary: 'Top sản phẩm bán chạy (có lọc khoảng ngày)' })
  async getTopProducts(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit = '10',
  ) {
    return this.reportService.getTopProducts(from, to, Number(limit) || 10);
  }
@Get('all-products-sales')
async getAllProductSales(@Query('from') from?: string, @Query('to') to?: string) {
  return this.reportService.getAllProductSales(from, to);
}
@Get('compare-months')
async compareMonths(@Query('months') months: string) {
  return this.reportService.compareMonths(months);
}

  /** 📦 Sản phẩm tồn kho thấp (ngưỡng tuỳ chọn) */
  @Get('stock')
  @ApiOperation({ summary: 'Danh sách sản phẩm có tồn kho thấp (threshold mặc định 10)' })
  async getLowStock(@Query('threshold') threshold = '10') {
    return this.reportService.getLowStock(Number(threshold) || 10);
  }

  /** 🏷️ Doanh thu theo Thương hiệu */
  @Get('revenue-by-brand')
  @ApiOperation({ summary: 'Thống kê doanh thu theo Thương hiệu (lọc từ ngày - đến ngày)' })
  async revenueByBrand(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportService.revenueByBrand(from, to);
  }

  /** 🗂️ Doanh thu theo Danh mục */
  @Get('revenue-by-category')
  @ApiOperation({ summary: 'Thống kê doanh thu theo Danh mục (lọc từ ngày - đến ngày)' })
  async revenueByCategory(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportService.revenueByCategory(from, to);
  }
}

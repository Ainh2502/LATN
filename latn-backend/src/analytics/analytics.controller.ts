import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('revenue-month')
  @ApiOperation({ summary: 'Revenue by month in a year' })
  @ApiQuery({ name: 'year', example: 2025, required: true })
  revenue(@Query('year') year: string) {
    return this.service.revenueByMonth(Number(year));
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top selling products' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  topProducts(@Query('limit') limit?: string) {
    return this.service.topProducts(Number(limit ?? 5));
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Top customers by spending' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  topCustomers(@Query('limit') limit?: string) {
    return this.service.topCustomers(Number(limit ?? 5));
  }
}

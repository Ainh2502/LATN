import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all inventories' })
  list() {
    return this.service.list();
  }

  @Get(':variantId')
  @ApiOperation({ summary: 'Get inventory by variantId' })
  get(@Param('variantId') variantId: string) {
    return this.service.get(variantId);
  }

  @Patch(':variantId')
  @ApiOperation({ summary: 'Upsert inventory by variantId' })
  update(@Param('variantId') variantId: string, @Body() dto: UpdateInventoryDto) {
    return this.service.update(variantId, dto as any);
  }
}

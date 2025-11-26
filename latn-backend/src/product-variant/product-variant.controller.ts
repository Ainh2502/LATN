import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('product-variant')
@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  @Get()
  @ApiOperation({ summary: 'List variants by product' })
  @ApiQuery({ name: 'productId', required: true })
  list(@Query('productId') productId: string) {
    return this.service.listByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one variant detail' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product variant (with optional inventory)' })
  create(@Body() dto: CreateVariantDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product variant (and inventory if provided)' })
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product variant and its inventory' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

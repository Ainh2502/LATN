import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Query } from '@nestjs/common';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 🟩 Tạo mới sản phẩm
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  // 🟩 Lấy danh sách sản phẩm (cho dashboard, mobile app)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (hỗ trợ bộ lọc)' })
  async findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  @Get('top-popular')
  @ApiOperation({ summary: 'Top 3 sản phẩm bán chạy nhất' })
  async getTopPopular() {
    return this.productService.getTopPopular();
  }

  @Get('newest')
  @ApiOperation({ summary: 'Top 3 sản phẩm mới nhất' })
  async getNewest() {
    return this.productService.getNewest();
  }
  @Get('colors')
@ApiOperation({ summary: 'Danh sách màu sắc duy nhất từ ProductVariant' })
async getAllColors() {
  return this.productService.getUniqueColors();
}

@Get('sizes')
@ApiOperation({ summary: 'Danh sách kích thước duy nhất từ ProductVariant' })
async getAllSizes() {
  return this.productService.getUniqueSizes();
}

  // 🟩 Lấy chi tiết 1 sản phẩm (bao gồm ảnh, variants, inventory, review)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  // 🟩 Cập nhật sản phẩm
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  // 🟩 Xóa sản phẩm (và dữ liệu liên quan)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}

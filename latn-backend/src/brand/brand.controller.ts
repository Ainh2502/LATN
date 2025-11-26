import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: '📋 Danh sách thương hiệu' })
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '🔍 Chi tiết thương hiệu' })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '➕ Tạo thương hiệu mới' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '✏️ Cập nhật thương hiệu' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '🗑️ Xóa thương hiệu' })
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}

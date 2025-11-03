import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@ApiTags('page')
@Controller('page')
export class PageController {
  constructor(private readonly service: PageService) {}

  @Get()
  @ApiOperation({ summary: 'List pages' })
  list() {
    return this.service.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get page by slug' })
  get(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create page' })
  create(@Body() dto: CreatePageDto) {
    return this.service.create(dto as any);
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update page' })
  update(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
    return this.service.update(slug, dto as any);
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete page' })
  remove(@Param('slug') slug: string) {
    return this.service.remove(slug);
  }
}

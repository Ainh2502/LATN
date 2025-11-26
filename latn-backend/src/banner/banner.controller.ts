import {
  Get,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  Controller, Post, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MinioService } from '../utils/minio/minio.service'; // đã có trong LATN
@ApiTags('product')

@Controller('banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly minioService: MinioService,
  ) {}
  @Post()
  @ApiOperation({ summary: 'Tạo banner mới' })
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannerService.create(createBannerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách banner' })
  findAll() {
    return this.bannerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin banner theo ID' })
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật banner' })
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannerService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa banner' })
  remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
    @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.minioService.uploadFile(file);
    return { url };
  }
}

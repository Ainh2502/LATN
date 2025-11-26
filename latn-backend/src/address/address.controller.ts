import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly service: AddressService) {}

  @Get()
  @ApiOperation({ summary: '📋 Danh sách địa chỉ của chính người dùng' })
  list(@GetUser('id') userId: string) {
    return this.service.listByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: '➕ Thêm địa chỉ mới (tự động gán user hiện tại)' })
  create(@GetUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '✏️ Cập nhật địa chỉ của chính mình' })
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '🗑️ Xoá địa chỉ của chính mình' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}

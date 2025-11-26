import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =======================  Dành cho người dùng (JWT) =======================

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Get('me')
@ApiOperation({ summary: '👤 Lấy thông tin cá nhân (từ JWT)' })
getMe(@Req() req: any) {
  console.log('🧩 req.user =', req.user);
  return this.userService.findOne(req.user.id);
}




  @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Patch('me')
@ApiOperation({ summary: '🛠️ Cập nhật thông tin cá nhân (tên, avatar...)' })
async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
  // Xóa các field không được phép cập nhật
  delete (dto as any).role;
  delete (dto as any).email;
  delete (dto as any).password; // ⚠️ Bắt buộc xoá để tránh lỗi Prisma
  return this.userService.update(req.user.id, dto);
}

  // =======================  CRUD (Admin quản lý) =======================

  @Get()
  @ApiOperation({ summary: '📋 Danh sách tài khoản (Admin)' })
  findAll() {
    return this.userService.findAll();
  }
  @Get('confirm-email')
  @ApiOperation({ summary: '✅ Xác nhận email mới (qua JWT token)' })
  async confirmEmail(@Query('token') token: string) {
    return this.userService.confirmEmailChange(token);
  }

  @Get(':id')
  @ApiOperation({ summary: '🔍 Chi tiết tài khoản (Admin)' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '➕ Tạo tài khoản mới (Admin)' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '✏️ Cập nhật tài khoản (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
  @Patch(':id/toggle')
  @ApiOperation({ summary: '🔒 Khóa hoặc mở khóa tài khoản (Admin)' })
  toggleActive(@Param('id') id: string) {
    return this.userService.toggleActive(id);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('request-email-change')
  @ApiOperation({ summary: '📨 Gửi mail xác nhận đổi email' })
  async requestEmailChange(@Req() req: any, @Body() body: { newEmail: string }) {
    return this.userService.requestEmailChange(req.user.id, body.newEmail);
  }


  @Delete(':id')
  @ApiOperation({ summary: '🗑️ Xóa tài khoản (Admin)' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  
}

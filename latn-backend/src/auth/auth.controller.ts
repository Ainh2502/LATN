import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaService } from '../config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService , private prisma: PrismaService,
    private jwt: JwtService,) {}

  // 📝 Đăng ký tài khoản mới
  @Post('register')
  @ApiOperation({ summary: '📝 Đăng ký tài khoản mới' })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
    @Get('confirm-register')
  async confirmRegister(@Query('token') token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new BadRequestException('Không tìm thấy người dùng');

      // ✅ cập nhật kích hoạt tài khoản
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: { isActive: true },
      });

      return { message: '🎉 Tài khoản đã được kích hoạt thành công', email: updated.email };
    } catch (err) {
      console.error('❌ [confirmRegister]', err);
      throw new BadRequestException('Liên kết không hợp lệ hoặc đã hết hạn');
    }
  }

  // 🔐 Đăng nhập trang quản trị
  @Post('login-admin')
  @ApiOperation({ summary: '🔐 Đăng nhập trang quản trị (ADMIN / STAFF)' })
  async loginAdmin(@Body() dto: LoginDto) {
    return this.auth.loginForRole(dto, ['ADMIN', 'STAFF']);
  }

  // 📱 Đăng nhập ứng dụng khách hàng
  @Post('login-client')
  @ApiOperation({ summary: '📱 Đăng nhập ứng dụng khách hàng (mọi tài khoản)' })
  async loginClient(@Body() dto: LoginDto) {
    // Cho phép tất cả các loại role
    return this.auth.loginForRole(dto, ['ADMIN', 'STAFF', 'CUSTOMER', 'SUPPLIER']);
  }

  // 📩 Quên mật khẩu
  @Post('forgot-password')
  @ApiOperation({ summary: '📩 Yêu cầu đặt lại mật khẩu (quên mật khẩu)' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  // 🔒 Đặt lại mật khẩu
  @Post('reset-password')
  @ApiOperation({ summary: '🔒 Đặt lại mật khẩu bằng token một lần' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }
}

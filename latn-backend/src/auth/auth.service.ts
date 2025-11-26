import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { MailService } from '../utils/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()

export class AuthService {
  
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailer: MailService,
  ) {}

  /**
   * 🧾 Đăng ký tài khoản mới
   */
  async register(dto: RegisterDto) {
  const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (exists) throw new BadRequestException('Email đã được sử dụng');

  // Tạo user chưa kích hoạt
  const passwordHash = await bcrypt.hash(dto.password, 10);
  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      name: dto.name,
      passwordHash,
      isActive: false, // ✅ chưa kích hoạt
    },
  });

  // Tạo token xác nhận
  const token = this.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '1h', secret: process.env.JWT_SECRET },
  );

  const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/#/confirm-register?token=${encodeURIComponent(token)}`;

  // Gửi mail xác nhận
  await this.mailer.sendRegisterConfirm(user.email, confirmUrl);

  return { message: '📨 Đã gửi mail xác nhận đăng ký. Vui lòng kiểm tra hộp thư!' };
}


  /**
   * 🔑 Đăng nhập cho từng nhóm role
   */
async loginForRole(dto: LoginDto, allowedRoles: string[]) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (!user) throw new UnauthorizedException('Sai thông tin đăng nhập');

  const ok = await bcrypt.compare(dto.password, user.passwordHash);
  if (!ok) throw new UnauthorizedException('Sai thông tin đăng nhập');

  // 🚫 Nếu tài khoản bị khóa
  if (user.isActive === false) {
    throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
  }

  // 🧱 Nếu role không nằm trong danh sách cho phép
  if (!allowedRoles.includes(user.role)) {
    throw new UnauthorizedException('Tài khoản không có quyền truy cập');
  }

  const token = await this.signToken(user.id, user.role);
  return this.buildResponse(user, token);
}

  /**
   * 📩 Gửi email khôi phục mật khẩu (quên mật khẩu)
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Không tiết lộ thông tin tồn tại email (bảo mật)
    if (!user) {
      return {
        message: 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn khôi phục.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await this.prisma.passwordReset.create({
      data: {
        id: cryptoRandomId(),
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${
      process.env.ADMIN_URL ?? 'http://localhost:5173'
    }/#/reset-password?token=${token}`;

await this.mailer.sendPasswordReset(email, resetLink);


    return {
      message: 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn khôi phục.',
      resetLink, // ⚠️ chỉ dùng khi DEV test
      expiresAt,
    };
  }

  /**
   * 🔒 Đặt lại mật khẩu bằng token (1 lần dùng)
   */
  async resetPassword(token: string, newPassword: string) {
  const record = await this.prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true }, // ✅ thêm include user để lấy email + role
  });

  if (!record) throw new BadRequestException('Token không hợp lệ');
  if (record.expiresAt.getTime() < Date.now()) {
    await this.prisma.passwordReset.delete({ where: { token } });
    throw new BadRequestException('Token đã hết hạn');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    this.prisma.passwordReset.delete({ where: { token } }),
  ]);

  return {
    message: 'Đặt lại mật khẩu thành công',
    email: record.user.email, // ✅ trả email
    role: record.user.role,   // ✅ trả role
  };
}


  /**
   * 🪪 Sinh JWT token
   */
  private async signToken(sub: string, role: Role, email?: string): Promise<string> {
    return this.jwt.signAsync({ sub, role, email });
  }

  /**
   * 📦 Chuẩn hoá dữ liệu trả về
   */
  private buildResponse(user: any, token: string) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive, // ✅ thêm dòng này
        createdAt: user.createdAt,
      },
      token,
    };
  }

}

/** 🔹 Hàm tạo ID ngẫu nhiên */
function cryptoRandomId(len = 16) {
  return randomBytes(len).toString('hex');
}

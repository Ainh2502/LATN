import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../utils/mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}
 /** ✅ Xác nhận token và cập nhật email */
 async confirmEmailChange(token: string) {
  try {
    const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
  const { sub: userId, newEmail } = payload;

    if (!newEmail) throw new BadRequestException('Thiếu email mới');

    const exists = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (exists) throw new BadRequestException('Email này đã được sử dụng');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

return {
  success: true,
  message: '✅ Đã cập nhật email thành công',
  email: updated.email,
};
  } catch (err: any) {
  console.error('❌ [confirmEmailChange]', err);
throw new BadRequestException({
  success: false,
  message: 'Token không hợp lệ hoặc đã hết hạn',
});
}
}
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,   // ✅ thêm dòng này
        createdAt: true,
      },
    });
  }


  async findOne(id: string) {
    // 🧩 Log ID nhận được từ JWT
    console.log('🔍 [UserService.findOne] Gọi /users/me với id:', id);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role ?? 'CUSTOMER',
        passwordHash,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    let passwordHash = user.passwordHash;

    if (dto.password) passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? user.email,
        name: dto.name ?? user.name,
        role: dto.role ?? user.role,
        passwordHash,
        isActive: dto.isActive ?? user.isActive, // ✅ thêm dòng này
      },
    });
  }

  // ✅ Toggle trạng thái hoạt động
  async toggleActive(id: string) {
    const user = await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return {
      message: updated.isActive ? 'Tài khoản đã được mở khóa' : 'Tài khoản đã bị khóa',
      user: updated,
    };
  }
/** 📨 Gửi mail xác nhận đổi email (dùng JWT, không cần DB) */
 async requestEmailChange(userId: string, newEmail: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('Không tìm thấy người dùng');

  const exists = await this.prisma.user.findUnique({ where: { email: newEmail } });
  if (exists) throw new BadRequestException('Email này đã được sử dụng');

  const token = this.jwt.sign(
    { sub: userId, newEmail },
    { expiresIn: '3h', secret: process.env.JWT_SECRET },
  );

  const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/#/confirm-email?token=${encodeURIComponent(token)}`;

  await this.mail.sendEmailChange(newEmail, confirmUrl);
  return { message: '📨 Đã gửi mail xác nhận tới ' + newEmail };
}

 


  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}

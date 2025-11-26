import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  /** 🔹 Lấy danh sách địa chỉ của user */
  async listByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { recipient: 'asc' }],
    });
  }

  /** 🔹 Tạo mới địa chỉ */
  async create(userIdFromToken: string, dto: CreateAddressDto) {
    // Không cho phép client tạo địa chỉ cho người khác
    if (dto.userId && dto.userId !== userIdFromToken) {
      throw new ForbiddenException('Không thể tạo địa chỉ cho người khác');
    }

    // Nếu đánh dấu là mặc định, huỷ mặc định cũ
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: userIdFromToken },
        data: { isDefault: false },
      });
    }

    // Tạo địa chỉ mới
    return this.prisma.address.create({
      data: {
        ...dto,
        userId: userIdFromToken, // ép dùng id từ token dù client gửi gì
      },
    });
  }

  /** 🔹 Cập nhật địa chỉ */
  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const found = await this.prisma.address.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy địa chỉ');
    if (found.userId !== userId)
      throw new ForbiddenException('Không được sửa địa chỉ của người khác');

    // Nếu đánh dấu mặc định mới → huỷ mặc định cũ
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  /** 🔹 Xoá địa chỉ */
  async remove(userId: string, id: string) {
    const found = await this.prisma.address.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy địa chỉ');
    if (found.userId !== userId)
      throw new ForbiddenException('Không được xoá địa chỉ của người khác');

    await this.prisma.address.delete({ where: { id } });
    return { ok: true };
  }

  /** 🔹 Lấy địa chỉ mặc định (tuỳ chọn tiện ích thêm) */
  async getDefault(userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    if (!address) {
      const any = await this.prisma.address.findFirst({ where: { userId } });
      return any || null;
    }
    return address;
  }
}

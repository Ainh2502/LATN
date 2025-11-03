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

  async listByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { recipient: 'asc' }],
    });
  }

async create(userIdFromToken: string, dto: CreateAddressDto) {
  if (dto.userId && dto.userId !== userIdFromToken) {
    throw new ForbiddenException('Không thể tạo địa chỉ cho người khác');
  }

  if (dto.isDefault) {
    await this.prisma.address.updateMany({
      where: { userId: userIdFromToken },
      data: { isDefault: false },
    });
  }

  return this.prisma.address.create({
    data: {
      ...dto,
      userId: userIdFromToken, // ép dùng id từ token dù client gửi gì
    },
  });
}


  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const found = await this.prisma.address.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy địa chỉ');
    if (found.userId !== userId)
      throw new ForbiddenException('Không được sửa địa chỉ của người khác');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.address.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy địa chỉ');
    if (found.userId !== userId)
      throw new ForbiddenException('Không được xoá địa chỉ của người khác');

    await this.prisma.address.delete({ where: { id } });
    return { ok: true };
  }
}

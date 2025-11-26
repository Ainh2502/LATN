import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { ListQueryDto } from './dto/list-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📋 Danh sách khách hàng (role = CUSTOMER)
   * Giống findAll() của UserService nhưng chỉ lọc role CUSTOMER
   */
  async list(q: ListQueryDto) {
    const { search, skip = 0, take = 20 } = q;

    const where: any = { role: 'CUSTOMER' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,      // ✅ trạng thái hoạt động
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  /**
   * 🔍 Chi tiết khách hàng (bao gồm địa chỉ và đơn hàng)
   */
  async detail(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { recipient: 'asc' }],
          select: {
            id: true,
            recipient: true,
            phone: true,
            province: true,
            district: true,
            ward: true,
            street: true,
            isDefault: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            grandTotal: true,
            paymentStatus: true,
            fulfillmentStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy khách hàng');
    return user;
  }

  /**
   * 🏠 Danh sách địa chỉ của khách hàng
   */
  async addresses(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!user) throw new NotFoundException('Không tìm thấy khách hàng');
    return this.prisma.address.findMany({
      where: { userId: id },
      orderBy: [{ isDefault: 'desc' }, { recipient: 'asc' }],
    });
  }

  /**
   * ✏️ Cập nhật thông tin khách hàng (tên, email)
   */
  async update(id: string, dto: UpdateCustomerDto) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!user) throw new NotFoundException('Không tìm thấy khách hàng');

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        email: dto.email ?? undefined,
      },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true },
    });
  }

  /**
   * 🔒 Mở / khóa tài khoản khách hàng
   */
  async toggleActive(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!user) throw new NotFoundException('Không tìm thấy khách hàng');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return {
      message: updated.isActive ? 'Tài khoản đã được mở khóa' : 'Tài khoản đã bị khóa',
      user: updated,
    };
  }

  /**
   * ❌ Xóa khách hàng (và địa chỉ cascade)
   */
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy khách hàng');
    if (user.role !== 'CUSTOMER')
      throw new BadRequestException('Chỉ được xoá tài khoản khách hàng');

    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}

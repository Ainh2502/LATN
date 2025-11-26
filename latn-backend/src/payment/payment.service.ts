/* 
 * LATN Modules - Payment Service (Final Version with Customer Update/Delete Support)
 */

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // ❌ KHÔNG dùng nữa cho findAll / findOne / update / remove
  // ❗ Vẫn giữ lại cho những API đặc biệt của Admin nếu cần
  private ensureAdmin(user: any) {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      throw new ForbiddenException(
        'Chỉ Admin hoặc Staff có quyền thao tác thanh toán',
      );
    }
  }

  // ============================================================
  // ⭐ Admin: xem tất cả
  // ⭐ Customer: chỉ xem payment của chính họ
  // ============================================================
  async findAll(user: any) {
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      return this.prisma.payment.findMany({
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // CUSTOMER
    return this.prisma.payment.findMany({
      where: {
        order: { userId: user.id },
      },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================
  // ⭐ Customer chỉ xem payment của họ
  // ============================================================
  async findOne(id: string, user: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { id }, // LƯU Ý: đây là payment.id, không phải orderId
      include: { order: true },
    });

    if (!payment)
      throw new NotFoundException('Không tìm thấy thanh toán findOne c');

    // Admin/Staff → xem tất cả
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      return payment;
    }

    // Customer chỉ xem payment của họ
    if (payment.order.userId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem giao dịch này');
    }

    return payment;
  }

  // ============================================================
  // ⭐ Customer được UPDATE payment của họ
  // ⭐ Admin/Staff UPDATE tất cả
  // ============================================================
  async update(id: string, dto: UpdatePaymentDto, user: any) {
    const existing = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!existing)
      throw new NotFoundException('Không tìm thấy thanh toán update');

    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';

    // CUSTOMER chỉ được update payment của họ
    if (!isAdmin && existing.order.userId !== user.id) {
      throw new ForbiddenException('Không có quyền cập nhật giao dịch này');
    }

    // CUSTOMER chỉ được đổi status cho một số trạng thái cho phép
    const allowedForCustomer = [
      PaymentStatus.PENDING,
      PaymentStatus.FAILED,
      PaymentStatus.PAID,
      PaymentStatus.REFUNDED,
    ];

    const newStatus = dto.status as PaymentStatus;

    if (!isAdmin) {
      if (!allowedForCustomer.includes(newStatus)) {
        throw new ForbiddenException(
          `Customer không thể đổi sang trạng thái ${newStatus}`,
        );
      }
    }

    // Admin thì update full, Customer chỉ update status
    const data: any = {
      status: newStatus,
    };

    // Admin cho phép chỉnh raw / provider / method / currency…
    if (isAdmin) {
      if (dto.transactionId) data.transactionId = dto.transactionId;
      if (dto.raw) data.raw = dto.raw;
      if (dto.amount) data.amount = dto.amount;
      if (dto.currency) data.currency = dto.currency;
      if (dto.provider) data.provider = dto.provider;
      if (dto.method) data.method = dto.method;
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data,
      include: { order: true },
    });

    // Đồng bộ trạng thái order
    await this.prisma.order.update({
      where: { id: updated.orderId },
      data: { paymentStatus: newStatus },
    });

    return {
      message: '🔄 Đã cập nhật trạng thái thanh toán',
      updated,
    };
  }

  // ============================================================
  // ⭐ Customer được DELETE payment của họ
  // ⭐ Admin/Staff delete tất cả
  // ============================================================
  async remove(id: string, user: any) {
    const existing = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existing)
      throw new NotFoundException('Không tìm thấy thanh toán remove');

    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';

    // CUSTOMER chỉ được xoá payment của họ
    if (!isAdmin && existing.order.userId !== user.id) {
      throw new ForbiddenException('Không có quyền xoá giao dịch này');
    }

    await this.prisma.payment.delete({ where: { id } });

    return { message: '🗑️ Đã xoá giao dịch thanh toán' };
  }

  // ============================================================
  // ⭐ VNPAY Integration
  // ============================================================

  private encodeVnpay(str: string): string {
    return encodeURIComponent(str)
      .replace(/%20/g, '+')
      .replace(/[!'()*]/g, (c) =>
        `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
      );
  }

  createVnpayUrl(orderId: string, amount: number, ipAddr: string) {
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE!;
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET!;
    const vnp_Url = process.env.VNPAY_URL!;
    const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL!;

    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);

    const createDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds(),
    )}`;

    const expire = new Date(now.getTime() + 15 * 60 * 1000);

    const expireDate = `${expire.getFullYear()}${pad(
      expire.getMonth() + 1,
    )}${pad(expire.getDate())}${pad(expire.getHours())}${pad(
      expire.getMinutes(),
    )}${pad(expire.getSeconds())}`;

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Amount: String(Math.round(Number(amount) * 100)),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedKeys = Object.keys(params).sort();

    const hashData = sortedKeys
      .map((k) => `${k}=${this.encodeVnpay(params[k])}`)
      .join('&');

    const secureHash = crypto
      .createHmac('sha512', vnp_HashSecret)
      .update(hashData, 'utf8')
      .digest('hex');

    const query = sortedKeys
      .map(
        (k) =>
          `${this.encodeVnpay(k)}=${this.encodeVnpay(params[k])}`,
      )
      .join('&');

    const paymentUrl = `${vnp_Url}?${query}&vnp_SecureHash=${secureHash}`;

    return { paymentUrl };
  }

  verifyVnpayChecksum(query: any): boolean {
    const secret = process.env.VNPAY_HASH_SECRET!;
    const received = query.vnp_SecureHash;

    const raw: Record<string, string> = { ...query };
    delete raw.vnp_SecureHash;
    delete raw.vnp_SecureHashType;

    const sortedKeys = Object.keys(raw).sort();

    const hashData = sortedKeys
      .map((k) => `${k}=${this.encodeVnpay(String(raw[k]))}`)
      .join('&');

    const signed = crypto
      .createHmac('sha512', secret)
      .update(hashData, 'utf8')
      .digest('hex');

    return signed === received;
  }

  /** 🔔 Xử lý IPN callback khi VNPAY báo kết quả (dùng chung cho /vnpay-ipn và /confirm) */
  async handleVnpayIpn(query: any, req?: Request) {
    console.log('🟢 [IPN] Callback từ VNPAY:', query);

    const valid = this.verifyVnpayChecksum(query);
    if (!valid) {
      console.error('❌ [IPN] Invalid checksum!');
      return { RspCode: '97', Message: 'Invalid checksum' };
    }

    const orderId = query.vnp_TxnRef; // VNPAY gửi về cái bạn dùng khi tạo URL
    const rspCode = query.vnp_ResponseCode;

    console.log(
      `🧾 [IPN] Nhận phản hồi cho orderId=${orderId}, code=${rspCode}`,
    );

    // 🔍 LẤY ĐƠN HÀNG TRƯỚC, KHÔNG TÌM PAYMENT NỮA
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('⚠️ [IPN] Không tìm thấy ORDER với id =', orderId);
      return { RspCode: '01', Message: 'Order not found' };
    }

    // ✅ Thanh toán thành công
    if (rspCode === '00') {
      console.log(
        '✅ [IPN] Thanh toán thành công. Cập nhật trạng thái...',
      );

      // Cập nhật tất cả payment thuộc order này (kể cả VNPAY / COD nếu có)
      await this.prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: PaymentStatus.PAID,
          provider: 'VNPAY',
          transactionId: query.vnp_TransactionNo,
        },
      });

      // Cập nhật trạng thái thanh toán của đơn
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      return { RspCode: '00', Message: 'Success' };
    }

    // ❌ Thanh toán thất bại
    console.log('❌ [IPN] Thanh toán thất bại');

    await this.prisma.payment.updateMany({
      where: { orderId },
      data: { status: PaymentStatus.FAILED },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.FAILED },
    });

    return { RspCode: '99', Message: 'Payment failed' };
  }
}

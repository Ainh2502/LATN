import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@ApiTags('payment-public')
@Controller("payment/public")
export class PaymentPublicController {
  constructor(private readonly service: PaymentService) {}

  // ⭐ IPN từ VNPAY (không JWT)
  @Get('vnpay-ipn')
  vnpayIpn(@Query() query: any, @Req() req: Request) {
    return this.service.handleVnpayIpn(query, req);
  }

  // ⭐ Endpoint xác nhận thanh toán khi user quay về từ VNPAY (không dùng IPN cũng được)
  @Get('confirm')
  confirm(@Query() query: any) {
    // Tái sử dụng luôn logic handleVnpayIpn:
    // - verify checksum
    // - cập nhật Order + Payment
    return this.service.handleVnpayIpn(query);
  }

  // ⭐ Tạo URL thanh toán VNPAY (GET) — PUBLIC
  @Get('vnpay/create')
  createVnpay(
    @Query('orderId') orderId: string,
    @Query('amount') amount: number,
    @Req() req: Request,
  ) {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    return this.service.createVnpayUrl(orderId, Number(amount), String(ip));
  }

  // ⭐ Tạo URL thanh toán VNPAY (POST) — PUBLIC
  @Post('vnpay/create')
  createVnpayPost(
    @Body() body: { orderId: string; amount: number },
    @Req() req: Request,
  ) {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    return this.service.createVnpayUrl(
      body.orderId,
      Number(body.amount),
      String(ip),
    );
  }

  // ⭐ (Tuỳ chọn) Return URL qua backend
  // Hiện tại bạn đang dùng return URL trực tiếp về FE,
  // nhưng mình giữ route này để sau dễ debug nếu cần.
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const valid = this.service.verifyVnpayChecksum(query);
    const success = valid && query.vnp_ResponseCode === '00';

    return res.redirect(
      `/payment-result?orderId=${query.vnp_TxnRef}&status=${
        success ? 'success' : 'failed'
      }`,
    );
  }
}

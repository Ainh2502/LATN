import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const path = req.path as string;

    // ⭐ BYPASS VNPAY IPN HOÀN TOÀN KHỎI JWT
    if (path.includes('/payment/vnpay-ipn')) {
      console.log('🔓 Bypass JwtAuthGuard for VNPAY IPN');
      return true;
    }

    console.log('🛡️ JwtAuthGuard: đang kiểm tra token...', path);
    console.log('Auth Header:', req.headers.authorization);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Swagger gọi lần đầu không có token → cho qua
    if (!user && !err && !info) return null;

    if (err || info)
      throw new UnauthorizedException(info?.message || err?.message);

    if (!user)
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');

    if (!user.id && user.sub) {
      user.id = user.sub;
      delete user.sub;
    }

    return user;
  }
}

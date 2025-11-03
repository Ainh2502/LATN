import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // ✅ Lấy request từ context
    const request = context.switchToHttp().getRequest();

    console.log('🛡️ JwtAuthGuard: đang kiểm tra token...');
    console.log('Auth Header:', request.headers.authorization);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // 🧩 Nếu có lỗi hoặc không có user => token sai hoặc hết hạn
    if (err || !user) {
      const reason =
        info?.message ||
        (err?.message ?? 'Token không hợp lệ hoặc đã hết hạn');
      console.error('❌ JWT Guard lỗi hoặc user không xác định:', reason);
      throw new UnauthorizedException(reason);
    }

    // ✅ Chuẩn hóa user từ payload (nếu có sub nhưng chưa có id)
    if (!user.id && user.sub) {
      user.id = user.sub;
      delete user.sub;
    }

    // ✅ Log user xác thực thành công
    console.log('✅ JwtAuthGuard: xác thực thành công cho user', user.id);
    return user;
  }
}

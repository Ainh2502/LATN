import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
  }

  /**
   * ✅ validate() được tự động gọi mỗi khi có Bearer Token
   */
  async validate(payload: any) {
  const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new NotFoundException('Không tìm thấy người dùng');
  return { id: user.id, email: user.email, role: user.role };
}

}

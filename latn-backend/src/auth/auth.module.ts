import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../config/prisma.module';
import { MailModule } from '../utils/mailer/mailer.module';

@Module({
  imports: [
    // ⚙️ Đăng ký default strategy
    PassportModule,
    JwtModule.register({
      secret: 'supersecretkey',
      signOptions: { expiresIn:'7d' },
    }),
    MailModule,
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService,
            JwtModule,
            PassportModule
  ],
})
export class AuthModule {}

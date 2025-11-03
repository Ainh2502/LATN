import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../config/prisma.module';
import { AuthModule } from '../auth/auth.module'; // ✅ thêm dòng này
import { MailModule } from '../utils/mailer/mailer.module'; // ✅ Thêm dòng này
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, 
      JwtModule.register({
    secret: process.env.JWT_SECRET,   // ✅ đảm bảo có secret
  }),
    AuthModule ,MailModule,], // ✅ thêm AuthModule ở đây
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

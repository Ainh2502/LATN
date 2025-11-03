import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';

@Module({
  imports: [PrismaModule],
  controllers: [PromotionController],
  providers: [PromotionService],
})
export class PromotionModule {}

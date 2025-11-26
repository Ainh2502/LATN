import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { PrismaService } from '../config/prisma.service';

@Module({
  controllers: [AttributeController],
  providers: [AttributeService, PrismaService],
})
export class AttributeModule {}

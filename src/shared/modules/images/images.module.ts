import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, PrismaService],
})
export class ImagesModule {}

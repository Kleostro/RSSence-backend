import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Module } from '@nestjs/common';

import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesUtilService } from './services/profiles-util.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService, FileService, ProfilesUtilService],
})
export class ProfilesModule {}

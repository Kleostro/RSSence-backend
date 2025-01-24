import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

import { ProfilesModule } from './modules/profiles/profiles.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
  imports: [ProfilesModule],
})
export class UsersModule {}

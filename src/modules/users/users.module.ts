import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

import { ProfilesModule } from '../profiles/profiles.module';
import { RolesService } from '../roles/roles.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ProfilesModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, RolesService],
  exports: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';

import { ProfilesModule } from '../profiles/profiles.module';
import { RolesModule } from '../roles/roles.module';
import { RolesService } from '../roles/roles.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ProfilesModule, RolesModule],
  controllers: [UsersController],
  providers: [UsersService, RolesService],
  exports: [UsersService, ProfilesModule, RolesModule],
})
export class UsersModule {}

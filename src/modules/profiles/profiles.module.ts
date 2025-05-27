import { FileService } from '@/shared/services/file/file.service';
import { Module } from '@nestjs/common';

import { AuthorsModule } from '../authors/authors.module';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [AuthorsModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, FileService],
  exports: [ProfilesService, AuthorsModule],
})
export class ProfilesModule {}

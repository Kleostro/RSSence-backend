import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Module } from '@nestjs/common';

import { PostsModule } from '../posts/posts.module';
import { ProfilesUtilService } from '../profiles/services/profiles-util.service';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { AuthorsUtilService } from './services/authors-util.service';

@Module({
  imports: [PostsModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsUtilService, ProfilesUtilService, PrismaService, FileService],
})
export class AuthorsModule {}

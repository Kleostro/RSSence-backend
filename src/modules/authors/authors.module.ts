import { FileService } from '@/shared/services/file/file.service';
import { Module } from '@nestjs/common';

import { PostsModule } from '../posts/posts.module';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [PostsModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, FileService],
  exports: [AuthorsService, PostsModule],
})
export class AuthorsModule {}

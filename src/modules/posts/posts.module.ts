import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

import { AuthorsUtilService } from '../authors/services/authors-util.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, AuthorsUtilService],
})
export class PostsModule {}

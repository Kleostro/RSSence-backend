import { Module } from '@nestjs/common';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ModerationPostsService } from './services/moderation-posts/moderation-posts.service';
import { PostLogService } from './services/post-log/post-log.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, ModerationPostsService, PostLogService],
  exports: [PostsService],
})
export class PostsModule {}

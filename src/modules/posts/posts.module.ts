import { Module } from '@nestjs/common';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ModerationPostsService } from './services/moderation-posts/moderation-posts.service';
import { PostLogService } from './services/post-log/post-log.service';
import { PostVersionDiffService } from './services/post-version-diff/post-version-diff.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, ModerationPostsService, PostLogService, PostVersionDiffService],
  exports: [PostsService],
})
export class PostsModule {}

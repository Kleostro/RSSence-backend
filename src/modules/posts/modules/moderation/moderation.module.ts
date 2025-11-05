import { RolesService } from '@/modules/roles/roles.service';
import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { PostsAccessService } from '../../services/posts-access.service';
import { PostsService } from '../../services/posts.service';
import { HistoryModule } from '../history/history.module';
import { VersionsModule } from '../versions/versions.module';
import { PostModerationController } from './controllers/post-moderation.controller';
import { PostModerationService } from './services/post-moderation.service';

@Module({
  imports: [VersionsModule, HistoryModule],
  controllers: [PostModerationController],
  providers: [PostModerationService, PostService, PostsAccessService, RolesService, PostsService],
  exports: [PostModerationService],
})
export class ModerationModule {}

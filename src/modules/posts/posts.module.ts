import { Module } from '@nestjs/common';

import { PostAuditController } from './controllers/post-audit.controller';
import { PostModerationController } from './controllers/post-moderation.controller';
import { PostsController } from './controllers/posts.controller';
import { PostVersionsController } from './controllers/versions.controller';
import { PostAuditService } from './services/post-audit.service';
import { PostHistoryService } from './services/post-history.service';
import { PostModerationService } from './services/post-moderation.service';
import { PostService } from './services/post.service';
import { PostsService } from './services/posts.service';
import { VersionDiffService } from './services/utils/version-diff.service';
import { VersionsService } from './services/versions.service';

@Module({
  controllers: [PostsController, PostModerationController, PostVersionsController, PostAuditController],
  providers: [
    PostsService,
    PostService,
    PostHistoryService,
    PostAuditService,
    PostModerationService,
    VersionsService,
    VersionDiffService,
  ],
  exports: [PostsService, PostModerationService, VersionsService, VersionDiffService, PostAuditService],
})
export class PostsModule {}

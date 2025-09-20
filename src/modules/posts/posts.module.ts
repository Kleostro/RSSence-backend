import { Module } from '@nestjs/common';

import { PostAuditController } from './controllers/post-audit.controller';
import { PostModerationController } from './controllers/post-moderation.controller';
import { PostViewsController } from './controllers/post-views.controller';
import { PostsController } from './controllers/posts.controller';
import { PostVersionsController } from './controllers/versions.controller';
import { PostViewCronJob } from './jobs/post-view.cron-job';
import { PostAuditService } from './services/post-audit.service';
import { PostHistoryService } from './services/post-history.service';
import { PostModerationService } from './services/post-moderation.service';
import { PostViewAggregationService } from './services/post-view-aggregation.service';
import { PostViewCurrentDayService } from './services/post-view-current-day.service';
import { PostViewDailyStatsService } from './services/post-view-daily-stats.service';
import { PostViewsService } from './services/post-views.service';
import { PostService } from './services/post.service';
import { PostsService } from './services/posts.service';
import { VersionDiffService } from './services/utils/version-diff.service';
import { VersionsService } from './services/versions.service';

@Module({
  controllers: [
    PostsController,
    PostViewsController,
    PostModerationController,
    PostVersionsController,
    PostAuditController,
  ],
  providers: [
    PostsService,
    PostViewsService,
    PostViewDailyStatsService,
    PostViewCurrentDayService,
    PostViewCronJob,
    PostViewAggregationService,
    PostService,
    PostHistoryService,
    PostAuditService,
    PostModerationService,
    VersionsService,
    VersionDiffService,
  ],
  exports: [
    PostsService,
    PostViewsService,
    PostViewCurrentDayService,
    PostViewCronJob,
    PostViewDailyStatsService,
    PostViewAggregationService,
    PostModerationService,
    VersionsService,
    VersionDiffService,
    PostAuditService,
  ],
})
export class PostsModule {}

import { Module } from '@nestjs/common';

import { PostsController } from './controllers/posts.controller';
import { PostCronJob } from './jobs/post.cron-job';
import { AuditModule } from './modules/audit/audit.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HistoryModule } from './modules/history/history.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { VersionsModule } from './modules/versions/versions.module';
import { ViewsModule } from './modules/views/views.module';
import { PostAnalyticsService } from './services/post-analytics.service';
import { PostsService } from './services/posts.service';

@Module({
  imports: [ViewsModule, VersionsModule, ModerationModule, AuditModule, HistoryModule, CommentsModule],
  controllers: [PostsController],
  providers: [PostsService, PostAnalyticsService, PostCronJob],
  exports: [PostsService],
})
export class PostsModule {}

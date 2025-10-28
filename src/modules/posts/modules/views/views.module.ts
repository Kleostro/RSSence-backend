import { Module } from '@nestjs/common';

import { CommentAggregationService } from '../comments/services/comment-aggregations.service';
import { CommentDailyStatsService } from '../comments/services/comment-daily-stats.service';
import { PostViewsController } from './controllers/post-views.controller';
import { PostViewAggregationService } from './services/post-view-aggregation.service';
import { PostViewCurrentDayService } from './services/post-view-current-day.service';
import { PostViewDailyStatsService } from './services/post-view-daily-stats.service';
import { PostViewsService } from './services/post-views.service';

@Module({
  controllers: [PostViewsController],
  providers: [
    PostViewsService,
    CommentAggregationService,
    CommentDailyStatsService,
    PostViewAggregationService,
    PostViewCurrentDayService,
    PostViewDailyStatsService,
  ],
  exports: [PostViewsService, PostViewCurrentDayService, PostViewDailyStatsService, PostViewAggregationService],
})
export class ViewsModule {}

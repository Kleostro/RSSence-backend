import { RolesService } from '@/modules/roles/roles.service';
import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { PostsAccessService } from '../../services/posts-access.service';
import { PostsService } from '../../services/posts.service';
import { CommentAggregationService } from '../comments/services/comment-aggregations.service';
import { CommentDailyStatsService } from '../comments/services/comment-daily-stats.service';
import { PostHistoryService } from '../history/services/post-history.service';
import { PostViewController } from './controllers/post-view.controller';
import { PostViewAggregationService } from './services/post-view-aggregation.service';
import { PostViewCurrentDayService } from './services/post-view-current-day.service';
import { PostViewDailyStatsService } from './services/post-view-daily-stats.service';
import { PostViewsService } from './services/post-views.service';

@Module({
  controllers: [PostViewController],
  providers: [
    PostViewsService,
    CommentAggregationService,
    CommentDailyStatsService,
    PostViewAggregationService,
    PostViewCurrentDayService,
    PostViewDailyStatsService,
    PostsAccessService,
    RolesService,
    PostsService,
    PostService,
    PostHistoryService,
  ],
  exports: [PostViewsService, PostViewCurrentDayService, PostViewDailyStatsService, PostViewAggregationService],
})
export class ViewsModule {}

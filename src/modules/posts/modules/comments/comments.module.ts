import { RolesService } from '@/modules/roles/roles.service';
import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { PostsAccessService } from '../../services/posts-access.service';
import { PostsService } from '../../services/posts.service';
import { PostHistoryService } from '../history/services/post-history.service';
import { CommentsController } from './controllers/comments.controller';
import { CommentAggregationService } from './services/comment-aggregations.service';
import { CommentCurrentDayService } from './services/comment-current-day.service';
import { CommentDailyStatsService } from './services/comment-daily-stats.service';
import { CommentsService } from './services/comments.service';

@Module({
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentAggregationService,
    CommentDailyStatsService,
    CommentCurrentDayService,
    PostsAccessService,
    RolesService,
    PostsService,
    PostService,
    PostHistoryService,
  ],
  exports: [CommentsService, CommentAggregationService, CommentDailyStatsService, CommentCurrentDayService],
})
export class CommentsModule {}

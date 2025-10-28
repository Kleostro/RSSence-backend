import { Module } from '@nestjs/common';

import { CommentsController } from './controllers/comments.controller';
import { CommentAggregationService } from './services/comment-aggregations.service';
import { CommentCurrentDayService } from './services/comment-current-day.service';
import { CommentDailyStatsService } from './services/comment-daily-stats.service';
import { CommentsService } from './services/comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentAggregationService, CommentDailyStatsService, CommentCurrentDayService],
  exports: [CommentsService, CommentAggregationService, CommentDailyStatsService, CommentCurrentDayService],
})
export class CommentsModule {}

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CommentAggregationService } from '../modules/comments/services/comment-aggregations.service';
import { CommentDailyStatsService } from '../modules/comments/services/comment-daily-stats.service';
import { PostViewAggregationService } from '../modules/views/services/post-view-aggregation.service';
import { PostViewDailyStatsService } from '../modules/views/services/post-view-daily-stats.service';

@Injectable()
export class PostCronJob {
  constructor(
    private readonly commentAggregationService: CommentAggregationService,
    private readonly commentDailyStatsService: CommentDailyStatsService,
    private readonly postViewDailyStatsService: PostViewDailyStatsService,
    private readonly postViewAggregationService: PostViewAggregationService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  public async generateDailyStats(): Promise<void> {
    await this.postViewDailyStatsService.generateDailyStats();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  public async generateDailyCommentStats(): Promise<void> {
    await this.commentDailyStatsService.generateDailyStats();
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async updateAggregations(): Promise<void> {
    await this.postViewAggregationService.updateAllAggregations();
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async updateCommentAggregations(): Promise<void> {
    await this.commentAggregationService.updateAllAggregations();
  }
}

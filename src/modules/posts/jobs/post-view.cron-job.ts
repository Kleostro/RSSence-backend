import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PostViewAggregationService } from '../services/post-view-aggregation.service';
import { PostViewDailyStatsService } from '../services/post-view-daily-stats.service';

@Injectable()
export class PostViewCronJob {
  constructor(
    private readonly dailyStatsService: PostViewDailyStatsService,
    private readonly aggregationService: PostViewAggregationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async generateDailyStats(): Promise<void> {
    await this.dailyStatsService.generateDailyStats();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  public async updateAggregations(): Promise<void> {
    await this.aggregationService.updateAllAggregations();
  }
}

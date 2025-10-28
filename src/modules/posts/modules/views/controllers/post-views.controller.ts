import { PostDailyQueryDto } from '@/modules/posts/dto/post-daily-query.dto';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PostViewDailyStatsService } from '../services/post-view-daily-stats.service';

@Controller('post-views')
export class PostViewsController {
  constructor(private readonly postViewDailyStatsService: PostViewDailyStatsService) {}

  @Get('post/:postId/trend')
  public async getPostViewTrend(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PostDailyQueryDto,
  ): Promise<{ uniqueViews: number; totalViews: number; date: Date }[]> {
    return this.postViewDailyStatsService.getPostViewTrend(postId, query.start, query.end);
  }
}

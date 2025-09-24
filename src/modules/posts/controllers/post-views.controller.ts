import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PostViewQueryDto } from '../dto/post-view-query.dto';
import { PostViewsService } from '../services/post-views.service';

@Controller('post-views')
export class PostViewsController {
  constructor(private readonly postViewsService: PostViewsService) {}

  @Get('post/:id/current')
  public async getCurrentPostViews(
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<{ uniqueViews: number; totalViews: number } | null> {
    return this.postViewsService.getCurrentPostViews(postId);
  }

  @Get('post/:postId/trend')
  public async getPostViewTrend(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PostViewQueryDto,
  ): Promise<{ uniqueViews: number; totalViews: number; date: Date }[]> {
    return this.postViewsService.getPostViewTrend(
      postId,
      query.start ? new Date(query.start) : undefined,
      query.end ? new Date(query.end) : undefined,
    );
  }
}

import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { POST_ACCESS_LEVEL } from '@/modules/posts/constants/post';
import { PostDailyQueryDto } from '@/modules/posts/dto/post-daily-query.dto';
import { PostsAccessService } from '@/modules/posts/services/posts-access.service';
import { FullUser } from '@/modules/users/types/user.type';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';

import { PostViewDailyStatsService } from '../services/post-view-daily-stats.service';

@Controller('post-views')
@UseGuards(JwtAccessGuard)
export class PostViewController {
  constructor(
    private readonly postsAccessService: PostsAccessService,
    private readonly postViewDailyStatsService: PostViewDailyStatsService,
  ) {}

  @Get(':postId/trend')
  public async getPostViewTrend(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PostDailyQueryDto,
    @CurrentUser() user: FullUser | null,
  ): Promise<{ uniqueViews: number; totalViews: number; date: Date }[]> {
    const hasAccess = await this.postsAccessService.hasAccess(
      user,
      { id: postId },
      POST_ACCESS_LEVEL.AUTHOR_OR_MODERATOR,
    );

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.postViewDailyStatsService.getPostViewTrend(postId, query.start, query.end);
  }
}

import { PostAuthor } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { POST_STATUS } from '@/modules/posts/constants/post';
import { FullUser } from '@/modules/users/types/user.type';
import { Injectable } from '@nestjs/common';

import { FullPostAnalytics } from '../interfaces/full-post-analytics';
import { CommentCurrentDayService } from '../modules/comments/services/comment-current-day.service';
import { PostViewCurrentDayService } from '../modules/views/services/post-view-current-day.service';
import { PostViewsService } from '../modules/views/services/post-views.service';

@Injectable()
export class PostAnalyticsService {
  constructor(
    private postViewsService: PostViewsService,
    private postViewCurrentDayService: PostViewCurrentDayService,
    private commentCurrentDayService: CommentCurrentDayService,
  ) {}

  public async getFullPostAnalytics(
    post: PostModel & {
      authors: PostAuthor[];
    },
    user: FullUser | null,
  ): Promise<FullPostAnalytics | null> {
    if (post.status !== POST_STATUS.APPROVED) {
      return null;
    }

    if (user && !this.postViewsService.isPostAuthorViewed(post, user.author?.id)) {
      await this.postViewsService.createOne(post.id, user.id);
    }

    const [views, comments] = await Promise.all([
      this.postViewCurrentDayService.getCurrentDayStats(post),
      this.commentCurrentDayService.getCurrentDayStats(post),
    ]);

    return { ...post, currentDayViewStats: views, currentDayCommentsStats: comments };
  }
}

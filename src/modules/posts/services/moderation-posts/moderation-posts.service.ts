import { Post as AuthorPost, ModerationHistory, Moderator, PostHistory } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { ACTION_TYPE, POST_STATUS, TARGET_TYPE } from '../../constants/post';
import { CreateModerationHistory } from '../../dto/create-moderation-history.dto';

@Injectable()
export class ModerationPostsService {
  constructor(private readonly prisma: PrismaService) {}

  private async saveToModerationHistory(data: CreateModerationHistory): Promise<ModerationHistory> {
    return this.prisma.moderationHistory.create({ data });
  }

  private async updatePostStatus(post: AuthorPost, data: CreateModerationHistory): Promise<AuthorPost> {
    const previousStatus = post.status;

    const updatedPost = await this.prisma.$transaction(async (prisma) => {
      const result = await prisma.post.update({
        where: { id: data.targetId },
        data: {
          status: data.newStatus,
        },
        include: {
          authors: { include: { author: true } },
          postHistory: true,
        },
      });

      if (previousStatus !== data.newStatus) {
        await this.saveToModerationHistory({ ...data, previousStatus });
      }

      return result;
    });

    return updatedPost;
  }

  public async getPostHistory(post: AuthorPost): Promise<(ModerationHistory | PostHistory)[]> {
    const postHistory = await this.prisma.$transaction(async (prisma) => {
      const moderationLogs = await prisma.moderationHistory.findMany({
        where: { targetId: post.id },
        include: { moderator: { include: { user: { select: { profile: true } } } } },
      });
      const generalLogs = await prisma.postHistory.findMany({ where: { postId: post.id }, include: { author: true } });
      return [...moderationLogs, ...generalLogs];
    });

    return postHistory.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public async approvePost(post: AuthorPost, moderator: Moderator): Promise<AuthorPost> {
    const data: CreateModerationHistory = {
      targetId: post.id,
      targetType: TARGET_TYPE.POST,
      newStatus: POST_STATUS.APPROVED,
      moderatorId: moderator.id,
      actionType: ACTION_TYPE.MODERATION_STATUS_CHANGED,
    };
    return this.updatePostStatus(post, data);
  }

  public async requestRevision(post: AuthorPost, comment: string, moderator: Moderator): Promise<AuthorPost> {
    const data: CreateModerationHistory = {
      targetId: post.id,
      targetType: TARGET_TYPE.POST,
      newStatus: POST_STATUS.REVISION_REQUIRED,
      moderatorId: moderator.id,
      actionType: ACTION_TYPE.MODERATION_STATUS_CHANGED,
      comment,
    };
    return this.updatePostStatus(post, data);
  }

  public async rejectPost(
    post: AuthorPost,
    dto: { comment: string; reasons: string[] },
    moderator: Moderator,
  ): Promise<AuthorPost> {
    const data: CreateModerationHistory = {
      targetId: post.id,
      targetType: TARGET_TYPE.POST,
      newStatus: POST_STATUS.REJECTED,
      moderatorId: moderator.id,
      actionType: ACTION_TYPE.MODERATION_STATUS_CHANGED,
      comment: dto.comment,
      reasons: dto.reasons,
    };
    return this.updatePostStatus(post, data);
  }
}

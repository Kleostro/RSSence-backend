import { PaginationService } from '@/common/services/pagination.service';
import { Author, ModerationHistory, Moderator, PostAuthor, PostStatus, Prisma } from '@/generated/prisma';
import { PostActionType } from '@/generated/prisma/enums';
import { PostModel } from '@/generated/prisma/models';
import {
  ACTION_TYPE,
  POST_AUTHOR_ACTION,
  POST_MODERATOR_ACTION,
  POST_STATUS,
  PostAuthorAction,
  PostModeratorAction,
  TARGET_TYPE,
} from '@/modules/posts/constants/post';
import { CreateModerationHistory } from '@/modules/posts/dto/create-moderation-history.dto';
import { VersionsService } from '@/modules/posts/services/versions.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { PostHistoryService } from './post-history.service';
import { PostService } from './post.service';

@Injectable()
export class PostModerationService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly postService: PostService,
    private readonly versionsService: VersionsService,
    private readonly postHistoryService: PostHistoryService,
  ) {
    super(prisma);
  }

  public getAll(where: Prisma.ModerationHistoryWhereInput): Promise<ModerationHistory[]> {
    return this.prisma.moderationHistory.findMany({
      where,
      include: { moderator: { include: { user: { select: { profile: true } } } } },
    });
  }

  private async updatePostStatus(post: PostModel, data: CreateModerationHistory): Promise<PostModel> {
    const previousStatus = post.status;

    const updatedPost = await this.prisma.$transaction(async (prisma) => {
      const result = await prisma.post.update({
        where: { id: data.targetId },
        data: { status: data.newStatus },
        include: { authors: { include: { author: true } }, postHistory: true },
      });

      if (previousStatus !== data.newStatus) {
        await this.saveToModerationHistory({ ...data, previousStatus });
      }

      return result;
    });

    return updatedPost;
  }

  private async saveToModerationHistory(data: CreateModerationHistory): Promise<ModerationHistory> {
    return this.prisma.moderationHistory.create({ data });
  }

  public async submitForModeration(postId: number, author: Author): Promise<PostModel> {
    await this.postService.ensureMainAuthor(postId, author.id);
    const post = await this.postService.findById(postId);

    const updated = await this.postService.updateStatus(postId, POST_STATUS.SUBMITTED);

    await this.postHistoryService.createOne({
      postId: updated.id,
      actionType: ACTION_TYPE.POST_SUBMITTED,
      authorId: author.id,
      description: `Post '${post.title}' submitted for moderation.`,
    });

    return updated;
  }

  public async performModeratorAction(
    postId: number,
    action: PostModeratorAction,
    moderator: Moderator,
    comment?: string,
    reasons?: string[],
  ): Promise<PostModel> {
    const post = await this.postService.findById(postId);
    const data: CreateModerationHistory = {
      targetId: post.id,
      targetType: TARGET_TYPE.POST,
      newStatus: this.getNewPostStatus(action),
      moderatorId: moderator.id,
      actionType: ACTION_TYPE.MODERATION_STATUS_CHANGED,
      comment,
      reasons,
    };
    const updatedPost = await this.updatePostStatus(post, data);
    if (action === POST_MODERATOR_ACTION.APPROVE) {
      await this.createVersionForApprovedPost(post);
    }
    return updatedPost;
  }

  private getNewPostStatus(action: PostModeratorAction | PostAuthorAction): PostStatus {
    switch (action) {
      case POST_AUTHOR_ACTION.SUBMIT:
        return POST_STATUS.SUBMITTED;
      case POST_AUTHOR_ACTION.SAVE_AS_DRAFT:
        return POST_STATUS.DRAFT;
      case POST_MODERATOR_ACTION.APPROVE:
        return POST_STATUS.APPROVED;
      case POST_MODERATOR_ACTION.REJECT:
        return POST_STATUS.REJECTED;
      case POST_MODERATOR_ACTION.REVISION_REQUEST:
        return POST_STATUS.REVISION_REQUIRED;
      default:
        return POST_STATUS.DRAFT;
    }
  }

  public async performAuthorAction(postId: number, action: PostAuthorAction, author: Author): Promise<PostModel> {
    await this.postService.ensureMainAuthor(postId, author.id);
    const post = await this.postService.findById(postId);
    const updated = await this.postService.updateStatus(postId, this.getNewPostStatus(action));
    const actionType = this.getAuthorActionType(action);
    await this.postHistoryService.createOne({
      postId: updated.id,
      actionType,
      authorId: author.id,
      description: `Post '${post.title}' ${this.getAuthorActionDescription(action)}`,
    });
    return updated;
  }

  private getAuthorActionType(action: PostAuthorAction): PostActionType {
    switch (action) {
      case POST_AUTHOR_ACTION.SUBMIT:
        return ACTION_TYPE.POST_SUBMITTED;
      case POST_AUTHOR_ACTION.SAVE_AS_DRAFT:
        return ACTION_TYPE.POST_UPDATED;
      default:
        return ACTION_TYPE.POST_UPDATED;
    }
  }

  private getAuthorActionDescription(action: PostAuthorAction): string {
    switch (action) {
      case POST_AUTHOR_ACTION.SUBMIT:
        return 'submitted for moderation.';
      case POST_AUTHOR_ACTION.SAVE_AS_DRAFT:
        return 'saved as draft.';
      default:
        return 'saved as draft.';
    }
  }

  public async createVersionForApprovedPost(post: PostModel & { authors: PostAuthor[] }): Promise<PostModel> {
    const mainAuthorId = post.authors.find((a) => a.isMainAuthor)!.authorId;
    const coauthorIds = post.authors.filter((a) => !a.isMainAuthor).map((a) => a.authorId);

    await this.versionsService.createPostVersion(post.id, post.title, post.content, coauthorIds, mainAuthorId);

    return post;
  }
}

import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Comment, PostAuthor, Prisma, VoteType } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { UserWithProfileAndAuthor } from '@/modules/users/types/user.type';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ROLES } from '@/shared/constants/roles';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CommentQueryDto } from '../dto/comment-query.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentsService extends PaginationService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async createOne(postId: number, profileId: number, dto: CreateCommentDto): Promise<Comment | void> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    if (dto.parentId !== undefined) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { postId: true },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.postId !== postId) {
        throw new ForbiddenException('Parent comment does not belong to this post');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        profileId,
        content: dto.content,
        parentId: dto.parentId,
      },
    });

    return comment;
  }

  public async getOne(where: Prisma.CommentWhereUniqueInput): Promise<Comment> {
    return this.findComment({ where });
  }

  private async findComment(options: Prisma.CommentFindUniqueArgs): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique(options);

    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND);
    }

    return comment;
  }

  public async updateOne(commentId: number, profileId: number, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findCommentWithRelations({ id: commentId });

    if (!comment || comment.isDeleted) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND);
    }

    const isAuthor = comment.profileId === profileId;

    if (!isAuthor) {
      throw new ForbiddenException('Not authorized to edit this comment');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
    });
  }

  private async findCommentWithRelations(
    where: Prisma.CommentWhereUniqueInput,
  ): Promise<Comment & { post: PostModel & { authors: PostAuthor[] } }> {
    const post = await this.prisma.comment.findUnique({
      where,
      include: { post: { include: { authors: true } }, profile: true },
    });

    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    return post;
  }

  public async deleteOne(
    commentId: number,
    user: (UserWithProfileAndAuthor & { roles: string[] }) | null,
  ): Promise<Comment> {
    const comment = await this.findCommentWithRelations({ id: commentId });
    if (!comment || comment.isDeleted) {
      throw new NotFoundException();
    }

    const accessRoles = [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];
    const hasPermission =
      comment.profileId === user?.profile?.id || accessRoles.some((role) => user?.roles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    const deletedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
      include: { profile: true },
    });

    return deletedComment;
  }

  public async getCommentsByPostId(postId: number, params: CommentQueryDto): Promise<PaginatedResponse<Comment>> {
    const where: Prisma.CommentWhereInput = {
      postId,
      parentId: null,
    };

    const orderBy: Prisma.CommentOrderByWithRelationInput =
      params.sort === 'popular' ? { likes: 'desc', createdAt: 'desc' } : { createdAt: 'desc' };

    const args: Prisma.CommentFindManyArgs = {
      where,
      include: {
        profile: true,
        commentVotes: true,
      },
      orderBy,
    };

    return super.getPaginatedResult<Comment, Prisma.CommentFindManyArgs>({
      model: this.prisma.comment,
      args,
      page: params.page,
      limit: params.limit,
    });
  }

  public async getChildrenByParentId(parentId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: {
        parentId,
      },
      include: {
        profile: true,
        commentVotes: true,
        children: { include: { profile: true, commentVotes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getCommentChildrenCount(parentId: number): Promise<{ count: number }> {
    return {
      count: await this.prisma.comment.count({ where: { parentId } }),
    };
  }

  public async vote(commentId: number, userId: number, voteType: VoteType): Promise<Comment | null> {
    const existingVote = await this.prisma.commentVote.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await this.prisma.commentVote.delete({ where: { id: existingVote.id } });
        await this.updateVoteCounts(commentId);
        return this.prisma.comment.findUnique({ where: { id: commentId } });
      }

      await this.prisma.commentVote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });
    } else {
      await this.prisma.commentVote.create({
        data: { commentId, userId, voteType },
      });
    }

    await this.updateVoteCounts(commentId);

    return this.prisma.comment.findUnique({ where: { id: commentId } });
  }

  private async updateVoteCounts(commentId: number): Promise<void> {
    const likes = await this.prisma.commentVote.count({
      where: { commentId, voteType: VoteType.LIKE },
    });
    const dislikes = await this.prisma.commentVote.count({
      where: { commentId, voteType: VoteType.DISLIKE },
    });

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likes, dislikes },
    });
  }
}

import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, Post as AuthorPost, ModerationHistory, Moderator, PostHistory } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { ACTION_TYPE, POST_STATUS } from './constants/post';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CoauthorsList, CurrentPostAuthors } from './interfaces/post-authors';
import { ModerationPostsService } from './services/moderation-posts/moderation-posts.service';
import { PostLogService } from './services/post-log/post-log.service';

@Injectable()
export class PostsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly moderationPostsService: ModerationPostsService,
    private readonly postLogService: PostLogService,
  ) {
    super(prisma, 'id', 'title');
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return super.getPaginatedResult({
      model: this.prisma.post,
      params,
      additionalWhere: params.filterField === 'status' ? { status: params.filter } : undefined,
      include: {
        authors: {
          include: { author: true },
        },
      },
    });
  }

  public async getSubmittedForModeration(params: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return super.getPaginatedResult({
      model: this.prisma.post,
      params,
      include: {
        authors: {
          include: { author: true },
        },
      },
      additionalWhere: { status: POST_STATUS.SUBMITTED },
    });
  }

  public async submitForModeration(postId: number, author: Author): Promise<AuthorPost> {
    const post = await this.ensurePostExists(postId);

    const updatedPost = await this.prisma.$transaction(async (prisma) => {
      const result = await prisma.post.update({
        where: { id: postId },
        data: { status: POST_STATUS.SUBMITTED },
        include: {
          authors: {
            include: { author: true },
          },
        },
      });

      const description = `Post '${post.title}' submitted for moderation`;

      await this.postLogService.logPostEvent(post, ACTION_TYPE.POST_SUBMITTED, author.username, description);
      return result;
    });

    return updatedPost;
  }

  public async saveAsDraft(postId: number, author: Author): Promise<AuthorPost> {
    const post = await this.ensurePostExists(postId);

    const updatedPost = await this.prisma.$transaction(async (prisma) => {
      const result = await prisma.post.update({
        where: { id: postId },
        data: { status: POST_STATUS.DRAFT },
        include: {
          authors: {
            include: { author: true },
          },
        },
      });

      const description = `Post '${post.title}' saved as draft`;

      await this.postLogService.logPostEvent(post, ACTION_TYPE.POST_UPDATED, author.username, description);
      return result;
    });

    return updatedPost;
  }

  public async getPostHistory(postId: number): Promise<(ModerationHistory | PostHistory)[]> {
    const post = await this.ensurePostExists(postId);
    return this.moderationPostsService.getPostHistory(post);
  }

  public async approvePost(postId: number, moderator: Moderator): Promise<AuthorPost> {
    const post = await this.ensurePostExists(postId);
    return this.moderationPostsService.approvePost(post, moderator);
  }

  public async requestRevision(postId: number, comment: string, moderator: Moderator): Promise<AuthorPost> {
    const post = await this.ensurePostExists(postId);
    return this.moderationPostsService.requestRevision(post, comment, moderator);
  }

  public async rejectPost(
    postId: number,
    dto: { comment: string; reasons: string[] },
    moderator: Moderator,
  ): Promise<AuthorPost> {
    const post = await this.ensurePostExists(postId);
    return this.moderationPostsService.rejectPost(post, dto, moderator);
  }

  public async getById(postId: number): Promise<AuthorPost | null> {
    return this.prisma.post.findFirst({
      where: { id: postId },
      include: {
        authors: {
          include: { author: true },
        },
      },
    });
  }

  public async createOne(dto: CreatePostDto, author: Author | undefined): Promise<AuthorPost> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const coauthorIds = this.getUniqueCoauthorIds(dto.coauthorIds, author.id);
    const coauthors = await this.prisma.author.findMany({ where: { id: { in: coauthorIds } } });

    const authorsData = [
      { authorUsername: author.username, isMainAuthor: true },
      ...coauthors.map((coauthor) => ({ authorUsername: coauthor.username, isMainAuthor: false })),
    ];

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        authors: {
          create: authorsData,
        },
      },
      include: {
        authors: {
          include: { author: true },
        },
      },
    });

    const newCoauthors = await this.createCoauthorsList(coauthorIds, author);
    const coauthorsDiff = this.postLogService.getCoauthorsDiff([], newCoauthors.slice(1));
    const changes: string[] = [];
    if (coauthorsDiff.added.length) {
      changes.push(`Added coauthors: ${coauthorsDiff.added.join(', ')}`);
    }

    const description = `Post '${post.title}' was created; ${changes.join('; ')}`;
    await this.postLogService.logPostEvent(post, ACTION_TYPE.POST_CREATED, author.username, description);

    return post;
  }

  private async createCoauthorsList(coauthorIds: number[], author: Author): Promise<CoauthorsList[]> {
    const authorIds = this.getUniqueCoauthorIds(coauthorIds, author.id);
    const coauthors = await this.prisma.author.findMany({ where: { id: { in: authorIds } } });
    return [
      { username: author.username, isMainAuthor: true },
      ...coauthors.map((coauthor) => ({ username: coauthor.username, isMainAuthor: false })),
    ];
  }

  private async getCurrentPostAuthors(postId: number): Promise<CurrentPostAuthors[]> {
    return this.prisma.postAuthor.findMany({
      where: { postId },
      select: { authorUsername: true, isMainAuthor: true },
    });
  }

  public async updateOne(postId: number, dto: UpdatePostDto, author: Author | undefined): Promise<AuthorPost> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const oldPost = await this.ensurePostExists(postId);
    const currentAuthors = await this.getCurrentPostAuthors(postId);

    const newAuthors = await this.createCoauthorsList(dto.coauthorIds ?? [], author);
    const newSet = new Set(newAuthors.map((a) => a.username));
    const currentSet = new Set(currentAuthors.map((a) => a.authorUsername));
    const toRemove = currentAuthors.filter((ca) => !newSet.has(ca.authorUsername));
    const toAdd = newAuthors.filter((a) => !currentSet.has(a.username));

    const updatedPost = await this.updateOneTransaction(postId, dto, toRemove, toAdd);

    const diff = this.postLogService.getPostDiff(oldPost, updatedPost);
    const coauthorsDiff = this.postLogService.getCoauthorsDiff(currentAuthors, newAuthors);

    const changes: string[] = [];

    if (diff.length) {
      changes.push(...diff);
    }

    if (coauthorsDiff.added.length) {
      changes.push(`Added coauthors: ${coauthorsDiff.added.join(', ')}`);
    }

    if (coauthorsDiff.removed.length) {
      changes.push(`Removed coauthors: ${coauthorsDiff.removed.join(', ')}`);
    }

    const description = `Post '${updatedPost.title}' was updated; ${changes.join('; ')}`;

    await this.postLogService.logPostEvent(updatedPost, ACTION_TYPE.POST_UPDATED, author.username, description);

    return updatedPost;
  }

  private async updateOneTransaction(
    postId: number,
    updatePostDto: UpdatePostDto,
    toRemove: CurrentPostAuthors[],
    toAdd: CoauthorsList[],
  ): Promise<AuthorPost> {
    return this.prisma.$transaction(async (prisma) => {
      if (toRemove.length > 0) {
        await prisma.postAuthor.deleteMany({
          where: {
            postId,
            authorUsername: { in: toRemove.map((a) => a.authorUsername) },
          },
        });
      }

      if (toAdd.length > 0) {
        await prisma.postAuthor.createMany({
          data: toAdd.map((a) => ({
            postId,
            authorUsername: a.username,
            isMainAuthor: a.isMainAuthor,
          })),
        });
      }

      return prisma.post.update({
        where: { id: postId },
        data: {
          title: updatePostDto.title,
          content: updatePostDto.content,
        },
        include: {
          authors: {
            include: { author: true },
          },
        },
      });
    });
  }

  public async deleteById(postId: number, author: Author | undefined): Promise<AuthorPost> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    await this.isPostAuthor(author.username, postId);

    const deletedPost = await this.prisma.post.delete({ where: { id: postId } });

    return deletedPost;
  }

  private async isPostAuthor(authorUsername: string, postId: number): Promise<boolean> {
    await this.ensurePostExists(postId);

    const postAuthor = await this.prisma.postAuthor.findFirst({ where: { authorUsername, postId } });
    if (!postAuthor) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_POST_AUTHOR);
    }

    return true;
  }

  private getUniqueCoauthorIds(coauthorIds: number[] | undefined, authorId: number): number[] {
    return coauthorIds ? Array.from(new Set(coauthorIds.filter((id) => id !== authorId))) : [];
  }

  private async ensurePostExists(postId: number): Promise<AuthorPost> {
    const hasPost = await this.hasPost(postId);
    if (!hasPost) {
      throw new NotFoundException(`Post for postId ${postId} does not exist.`);
    }

    return hasPost;
  }

  private async hasPost(postId: number): Promise<AuthorPost | null> {
    const result = await this.prisma.post.findFirst({ where: { id: postId } });
    return result;
  }
}

import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import {
  Author,
  ModerationHistory,
  Moderator,
  PostActionType,
  PostAuthor,
  PostHistory,
  Post as PostModel,
  PostStatus,
  PostVersion,
  Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { ACTION_TYPE, POST_STATUS } from './constants/post';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CoauthorsList, CurrentPostAuthors } from './interfaces/post-authors';
import { PostVersionDiff } from './interfaces/post-version-diff';
import { ModerationPostsService } from './services/moderation-posts/moderation-posts.service';
import { PostLogService } from './services/post-log/post-log.service';
import { PostVersionDiffService } from './services/post-version-diff/post-version-diff.service';

@Injectable()
export class PostsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly moderationPostsService: ModerationPostsService,
    private readonly postLogService: PostLogService,
    private readonly postVersionDiffService: PostVersionDiffService,
  ) {
    super(prisma, 'id', 'title');
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<PostModel>> {
    return super.getPaginatedResult({
      model: this.prisma.post,
      params,
      additionalWhere: params.filterField === 'status' ? { status: params.filter } : undefined,
      include: this.getPostAuthorsInclude(),
    });
  }

  private async createPostVersion(
    postId: number,
    title: string,
    content: string,
    coauthorsIds: number[],
    authorId: number,
  ): Promise<PostVersion> {
    const latestVersion = await this.prisma.postVersion.findFirst({
      where: { postId },

      orderBy: { version: 'desc' },
    });

    const version = (latestVersion?.version || 0) + 1;

    await this.prisma.postVersion.updateMany({
      where: { postId, isCurrent: true },
      data: { isCurrent: false },
    });

    return this.prisma.postVersion.create({
      data: {
        postId,
        title,
        content,
        version,
        coauthorsIds,
        isCurrent: true,
        authorId,
      },
    });
  }

  public async getSubmittedForModeration(params: QueryParamsDto): Promise<PaginatedResponse<PostModel>> {
    return super.getPaginatedResult({
      model: this.prisma.post,
      params,
      include: this.getPostAuthorsInclude(),
      additionalWhere: { status: POST_STATUS.SUBMITTED },
    });
  }

  public async submitForModeration(postId: number, author: Author): Promise<PostModel> {
    const post = await this.findPostWithAuthors(postId);
    await this.validatePostAuthor(post, author.id);

    return this.updatePostStatusAndLog(
      post.id,
      POST_STATUS.SUBMITTED,
      author,
      ACTION_TYPE.POST_SUBMITTED,
      `Post '${post.title}' submitted for moderation`,
    );
  }

  private async updatePostStatusAndLog(
    postId: number,
    status: PostStatus,
    author: Author,
    action: PostActionType,
    description: string,
  ): Promise<PostModel> {
    return this.prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: { status },
        include: this.getPostAuthorsInclude(),
      });

      await this.postLogService.logPostEvent(updatedPost, action, author.id, description);
      return updatedPost;
    });
  }

  private async validatePostAuthor(post: PostModel, authorId: number): Promise<void> {
    const isAuthor = await this.prisma.postAuthor.findFirst({
      where: { postId: post.id, authorId, isMainAuthor: true },
    });

    if (!isAuthor) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_POST_AUTHOR);
    }
  }

  public async saveAsDraft(postId: number, author: Author): Promise<PostModel> {
    const post = await this.findPostWithAuthors(postId);
    await this.validatePostAuthor(post, author.id);

    return this.updatePostStatusAndLog(
      post.id,
      POST_STATUS.DRAFT,
      author,
      ACTION_TYPE.POST_UPDATED,
      `Post '${post.title}' saved as draft`,
    );
  }

  public async getPostHistory(postId: number): Promise<(ModerationHistory | PostHistory)[]> {
    const post = await this.findPost(postId);
    return this.moderationPostsService.getPostHistory(post);
  }

  public async approvePost(postId: number, moderator: Moderator): Promise<PostModel> {
    const post = await this.findPostWithAuthors(postId);
    const approvedPost = await this.moderationPostsService.approvePost(post, moderator);

    const mainAuthorId = post.authors.filter((a) => a.isMainAuthor).map((a) => a.authorId)[0];
    const coauthorIds = post.authors.filter((a) => !a.isMainAuthor).map((a) => a.authorId);

    await this.createPostVersion(approvedPost.id, approvedPost.title, approvedPost.content, coauthorIds, mainAuthorId);

    return approvedPost;
  }

  public async requestRevision(postId: number, comment: string, moderator: Moderator): Promise<PostModel> {
    const post = await this.findPost(postId);
    return this.moderationPostsService.requestRevision(post, comment, moderator);
  }

  public async rejectPost(
    postId: number,
    dto: { comment: string; reasons: string[] },
    moderator: Moderator,
  ): Promise<PostModel> {
    const post = await this.findPost(postId);
    return this.moderationPostsService.rejectPost(post, dto, moderator);
  }

  public async getById(postId: number): Promise<PostModel | null> {
    return this.prisma.post.findFirst({
      where: { id: postId },
      include: this.getPostAuthorsInclude(),
    });
  }

  private getPostAuthorsInclude(): Prisma.PostInclude {
    return { authors: { include: { author: true } } };
  }

  public async createOne(dto: CreatePostDto, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const coauthorIds = this.getUniqueCoauthorIds(dto.coauthorIds, author.id);
    const authorsData = this.buildAuthorsData(author.id, coauthorIds);

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        authors: { create: authorsData },
      },
      include: this.getPostAuthorsInclude(),
    });

    await this.logPostCreation(post, author, coauthorIds);
    return post;
  }

  private buildCoauthorsList(coauthorIds: number[], authorId: number): CoauthorsList[] {
    const uniqueIds = this.getUniqueCoauthorIds(coauthorIds, authorId);
    return [{ id: authorId, isMainAuthor: true }, ...uniqueIds.map((id) => ({ id, isMainAuthor: false }))];
  }

  private async logPostCreation(post: PostModel, author: Author, coauthorIds: number[]): Promise<void> {
    const newCoauthors = this.buildCoauthorsList(coauthorIds, author.id);
    const coauthorsDiff = this.postLogService.getCoauthorsDiff([], newCoauthors.slice(1));

    const addedCoauthors = coauthorsDiff.added.length ? await this.getAuthorsByIds(coauthorsDiff.added) : [];

    const addedUsernames = addedCoauthors.map((a) => a.username);
    const changes: string[] = [];

    if (addedUsernames.length) {
      changes.push(`Added coauthors: ${addedUsernames.join(', ')}`);
    }

    const description = `Post '${post.title}' was created; ${changes.join('; ')}`;
    await this.postLogService.logPostEvent(post, ACTION_TYPE.POST_CREATED, author.id, description);
  }

  private async getAuthorsByIds(authorIds: number[]): Promise<Author[]> {
    if (!authorIds.length) {
      return [];
    }
    return this.prisma.author.findMany({
      where: { id: { in: authorIds } },
    });
  }

  private buildAuthorsData(mainAuthorId: number, coauthorIds: number[]): CurrentPostAuthors[] {
    return [
      { authorId: mainAuthorId, isMainAuthor: true },
      ...coauthorIds.map((id) => ({ authorId: id, isMainAuthor: false })),
    ];
  }

  public async updateOne(postId: number, dto: UpdatePostDto, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const oldPost = await this.findPostWithAuthors(postId);
    await this.validatePostAuthor(oldPost, author.id);

    const currentAuthors = await this.getCurrentAuthors(postId);
    const newAuthors = this.buildCoauthorsList(dto.coauthorIds ?? [], author.id);
    const changes = await this.getUpdateChanges(oldPost, currentAuthors, newAuthors, dto);

    const updatedPost = await this.performPostUpdate(postId, dto, currentAuthors, newAuthors);

    await this.postLogService.logPostEvent(
      updatedPost,
      ACTION_TYPE.POST_UPDATED,
      author.id,
      `Post '${updatedPost.title}' was updated; ${changes.length ? changes.join('; ') : 'No changes'}`,
    );

    return updatedPost;
  }

  private async performPostUpdate(
    postId: number,
    dto: UpdatePostDto,
    currentAuthors: CurrentPostAuthors[],
    newAuthors: CoauthorsList[],
  ): Promise<PostModel> {
    const toRemove = currentAuthors.filter((ca) => !newAuthors.some((na) => na.id === ca.authorId));
    const toAdd = newAuthors.filter((na) => !currentAuthors.some((ca) => ca.authorId === na.id));

    return this.prisma.$transaction(async (tx) => {
      if (toRemove.length) {
        await tx.postAuthor.deleteMany({
          where: {
            postId,
            authorId: { in: toRemove.map((a) => a.authorId) },
          },
        });
      }

      if (toAdd.length) {
        await tx.postAuthor.createMany({
          data: toAdd.map((a) => ({ postId, authorId: a.id, isMainAuthor: a.isMainAuthor })),
        });
      }

      return tx.post.update({
        where: { id: postId },
        data: {
          title: dto.title,
          content: dto.content,
        },
        include: this.getPostAuthorsInclude(),
      });
    });
  }

  private async getUpdateChanges(
    oldPost: PostModel & { authors: PostAuthor[] },
    currentAuthors: CurrentPostAuthors[],
    newAuthors: CoauthorsList[],
    dto: UpdatePostDto,
  ): Promise<string[]> {
    const changes: string[] = [];

    const fieldDiff = this.postLogService.getPostDiff(oldPost, {
      ...oldPost,
      title: dto.title ?? oldPost.title,
      content: dto.content ?? oldPost.content,
    });

    if (fieldDiff.length) {
      changes.push(...fieldDiff);
    }

    const coauthorsDiff = this.postLogService.getCoauthorsDiff(currentAuthors, newAuthors);

    if (coauthorsDiff.added.length) {
      const added = await this.getAuthorsByIds(coauthorsDiff.added);
      changes.push(`Added coauthors: ${added.map((a) => a.username).join(', ')}`);
    }

    if (coauthorsDiff.removed.length) {
      const removed = await this.getAuthorsByIds(coauthorsDiff.removed);
      changes.push(`Removed coauthors: ${removed.map((a) => a.username).join(', ')}`);
    }

    return changes;
  }

  private async getCurrentAuthors(postId: number): Promise<CurrentPostAuthors[]> {
    return this.prisma.postAuthor.findMany({
      where: { postId },
      select: { authorId: true, isMainAuthor: true },
    });
  }

  public async getPostVersions(postId: number, params: QueryParamsDto): Promise<PaginatedResponse<PostVersion>> {
    await this.findPost(postId);

    return this.getPaginatedResult({
      model: this.prisma.postVersion,
      params: { ...params, sortOrder: 'desc', sortBy: 'version' },
      additionalWhere: { postId },
    });
  }

  public async deletePostVersion(postId: number, version: number): Promise<PostVersion> {
    await this.findPost(postId);

    const targetVersion = await this.prisma.postVersion.findFirst({ where: { postId, version } });

    if (!targetVersion) {
      throw new NotFoundException(ERROR_MESSAGES.VERSION_NOT_FOUND);
    }

    return this.prisma.postVersion.delete({ where: { id: targetVersion.id } });
  }

  public async comparePostVersions(postId: number, from: number, to: number): Promise<PostVersionDiff> {
    const [versionFrom, versionTo] = await Promise.all([
      this.prisma.postVersion.findFirst({ where: { postId, version: from } }),
      this.prisma.postVersion.findFirst({ where: { postId, version: to } }),
    ]);

    if (!versionFrom) {
      throw new NotFoundException(`Version ${from} not found`);
    }
    if (!versionTo) {
      throw new NotFoundException(`Version ${to} not found`);
    }

    const [coauthorsFrom, coauthorsTo] = await Promise.all([
      this.getAuthorsByIds(versionFrom.coauthorsIds),
      this.getAuthorsByIds(versionTo.coauthorsIds),
    ]);

    const titleDiff = this.postVersionDiffService.createSideBySideWithInlineDiff(versionFrom.title, versionTo.title);
    const contentDiff = this.postVersionDiffService.createSideBySideWithInlineDiff(
      versionFrom.content ?? '',
      versionTo.content ?? '',
    );
    const coauthorsDiff = this.postVersionDiffService.createSideBySideWithInlineDiff(
      coauthorsFrom.map((a) => a.username).join(', '),
      coauthorsTo.map((a) => a.username).join(', '),
    );

    return {
      versionFrom: versionFrom.version,
      versionTo: versionTo.version,
      createdAtFrom: versionFrom.createdAt,
      createdAtTo: versionTo.createdAt,
      title: { old: versionFrom.title, new: versionTo.title, diff: titleDiff },
      content: { old: versionFrom.content, new: versionTo.content, diff: contentDiff },
      coauthors: {
        old: coauthorsFrom.map((a) => a.username),
        new: coauthorsTo.map((a) => a.username),
        diff: coauthorsDiff,
      },
    };
  }

  public async revertToVersion(postId: number, version: number, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    await this.findPost(postId);

    const targetVersion = await this.prisma.postVersion.findFirst({
      where: { postId, version },
    });

    if (!targetVersion) {
      throw new NotFoundException(ERROR_MESSAGES.VERSION_NOT_FOUND);
    }

    return this.prisma.$transaction(async (tx) => {
      const validCoauthorIds = await this.getValidCoauthorIds(tx, targetVersion.coauthorsIds);
      await this.deactivateCurrentVersion(tx, postId);
      await this.activateTargetVersion(tx, targetVersion.id);

      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          title: targetVersion.title,
          content: targetVersion.content,
          authors: {
            deleteMany: { postId, isMainAuthor: false },
            create: validCoauthorIds.map((id) => ({ authorId: id, isMainAuthor: false })),
          },
        },
        include: this.getPostAuthorsInclude(),
      });

      await this.postLogService.logPostEvent(
        updatedPost,
        ACTION_TYPE.POST_VERSION_REVERTED,
        author.id,
        `Post '${updatedPost.title}' was reverted to version ${version}`,
      );

      return updatedPost;
    });
  }

  private async deactivateCurrentVersion(tx: Prisma.TransactionClient, postId: number): Promise<void> {
    await tx.postVersion.updateMany({
      where: { postId, isCurrent: true },
      data: { isCurrent: false },
    });
  }

  private async activateTargetVersion(tx: Prisma.TransactionClient, versionId: number): Promise<void> {
    await tx.postVersion.update({
      where: { id: versionId },
      data: { isCurrent: true },
    });
  }

  private async getValidCoauthorIds(tx: Prisma.TransactionClient, coauthorIds: number[]): Promise<number[]> {
    if (coauthorIds.length) {
      return [];
    }

    const existing = await tx.author.findMany({
      where: { id: { in: coauthorIds } },
      select: { id: true },
    });

    return existing.map((a) => a.id);
  }

  public async deleteById(postId: number, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const post = await this.findPost(postId);
    await this.validatePostAuthor(post, author.id);

    return this.prisma.post.delete({ where: { id: postId } });
  }

  private getUniqueCoauthorIds(coauthorIds: number[] | undefined, authorId: number): number[] {
    return coauthorIds ? Array.from(new Set(coauthorIds.filter((id) => id !== authorId))) : [];
  }

  private async findPost(postId: number): Promise<PostModel> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    return post;
  }

  private async findPostWithAuthors(postId: number): Promise<PostModel & { authors: PostAuthor[] }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.getPostAuthorsInclude(),
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    return post;
  }
}

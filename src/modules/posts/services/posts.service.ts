import { randomUUID } from 'crypto';
import slugify from 'slugify';

import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, PostAuthor, Post as PostModel, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { ACTION_TYPE, POST_STATUS } from '../constants/post';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostQueryParamsDto } from '../dto/post-query-params.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostAuthors } from '../interfaces/post-authors';
import { PostSortBy } from '../interfaces/post-sort-by';
import { PostHistoryService } from '../modules/history/services/post-history.service';
import { PostService } from './post.service';

@Injectable()
export class PostsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly postService: PostService,
    private readonly postHistoryService: PostHistoryService,
  ) {
    super(prisma);
  }

  public async getAll(params: PostQueryParamsDto): Promise<PaginatedResponse<PostModel>> {
    const conditions: Prisma.PostWhereInput[] = [];
    if (params.status && params.status.length > 0) {
      conditions.push({ status: { in: params.status } });
    }

    const finalWhere: Prisma.PostWhereInput = conditions.length > 1 ? { AND: conditions } : conditions[0];

    const args: Prisma.PostFindManyArgs = {
      where: finalWhere,
      include: { authors: { include: { author: true } }, postViewAggregation: true, commentAggregation: true },
      orderBy: this.buildOrderBy(params),
    };

    return super.getPaginatedResult<PostModel, Prisma.PostFindManyArgs>({
      model: this.prisma.post,
      args,
      page: params.page,
      limit: params.limit,
    });
  }

  public async getPostsByAuthor(
    username: string,
    params: PostQueryParamsDto,
    meAuthorUsername?: string,
  ): Promise<PaginatedResponse<PostModel>> {
    const conditions: Prisma.PostWhereInput[] = [];
    if (meAuthorUsername === username && params.status && params.status.length) {
      conditions.push({ status: { in: params.status } });
    } else if (meAuthorUsername !== username) {
      conditions.push({ status: POST_STATUS.APPROVED });
    }

    this.addPostSearchConditions(conditions, params);

    conditions.push({
      authors: {
        some: { author: { username }, ...(params.isMainAuthor !== undefined && { isMainAuthor: params.isMainAuthor }) },
      },
    });

    const finalWhere: Prisma.PostWhereInput = conditions.length > 1 ? { AND: conditions } : conditions[0];

    const args: Prisma.PostFindManyArgs = {
      where: finalWhere,
      include: { authors: { include: { author: true } }, postViewAggregation: true, commentAggregation: true },
      orderBy: this.buildOrderBy(params),
    };

    return super.getPaginatedResult<PostModel, Prisma.PostFindManyArgs>({
      model: this.prisma.post,
      args,
      page: params.page,
      limit: params.limit,
    });
  }

  private buildOrderBy(params: PostQueryParamsDto): Prisma.PostOrderByWithRelationInput {
    const { sortBy, sortOrder } = params;

    if (!sortBy) {
      return { createdAt: sortOrder || 'desc' };
    }

    switch (sortBy) {
      case PostSortBy.UNIQUE_VIEWS:
        return {
          postViewAggregation: {
            uniqueViews: sortOrder === 'desc' ? 'desc' : 'asc',
          },
        };

      case PostSortBy.TOTAL_VIEWS:
        return {
          postViewAggregation: {
            totalViews: sortOrder === 'desc' ? 'desc' : 'asc',
          },
        };

      case PostSortBy.CREATED_AT:
      case PostSortBy.TITLE:
        return {
          [sortBy]: sortOrder || 'asc',
        };

      default:
        return { createdAt: sortOrder || 'desc' };
    }
  }

  public addPostSearchConditions(
    conditions: Prisma.PostWhereInput[],
    params: PostQueryParamsDto,
  ): Prisma.PostWhereInput[] {
    if (!params.search || !params.searchField) {
      return conditions;
    }

    switch (params.searchField) {
      case Prisma.PostScalarFieldEnum.title:
      case Prisma.PostScalarFieldEnum.content:
        conditions.push({ [params.searchField]: { contains: params.search, mode: 'insensitive' } });
        break;

      case Prisma.AuthorScalarFieldEnum.username: {
        const usernames = params.search
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);

        if (usernames.length) {
          conditions.push({ authors: { some: { author: { username: { in: usernames } } } } });
        }
        break;
      }
      default:
        break;
    }

    return conditions;
  }

  public async getOne(where: Prisma.PostWhereUniqueInput): Promise<PostModel | null> {
    return this.findPostWithAuthors(where);
  }

  public async createOne(data: CreatePostDto, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const coauthorIds = this.getUniqueCoauthorIds(data.coauthorIds, author.id);
    const authorsData = this.buildAuthorsData(author.id, coauthorIds);

    const candidateSlug = `${slugify(data.title, { lower: true })}_${randomUUID()}`;

    const isExistingSlug = await this.prisma.post.findFirst({ where: { slug: candidateSlug } });

    if (isExistingSlug) {
      throw new ConflictException(ERROR_MESSAGES.POST_SLUG_ALREADY_EXISTS);
    }

    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        slug: candidateSlug,
        authors: { create: authorsData },
      },
      include: { authors: { include: { author: true } } },
    });

    await this.logPostCreation(post, author, coauthorIds);
    return post;
  }

  public getPostDiff(oldPost: PostModel, newPost: PostModel): string[] {
    const changes: string[] = [];

    if (oldPost.title !== newPost.title) {
      changes.push(`Title changed from "${oldPost.title}" to "${newPost.title}"`);
    }

    if (oldPost.content !== newPost.content) {
      changes.push(`Content changed.`);
    }

    return changes;
  }

  public getCoauthorsDiff(
    oldAuthors: PostAuthors[],
    newCoauthors: PostAuthors[],
  ): { added: number[]; removed: number[] } {
    const oldSet = new Set(oldAuthors.map((a) => a.authorId));
    const newSet = new Set(newCoauthors.map((a) => a.authorId));

    const added = [...newSet].filter((u) => !oldSet.has(u));
    const removed = [...oldSet].filter((u) => !newSet.has(u));

    return { added, removed };
  }

  private buildPostAuthors(coauthorIds: number[], authorId: number): PostAuthors[] {
    const uniqueIds = this.getUniqueCoauthorIds(coauthorIds, authorId);
    return [{ authorId, isMainAuthor: true }, ...uniqueIds.map((id) => ({ authorId: id, isMainAuthor: false }))];
  }

  private async logPostCreation(post: PostModel, author: Author, coauthorIds: number[]): Promise<void> {
    const added = coauthorIds.length ? await this.prisma.author.findMany({ where: { id: { in: coauthorIds } } }) : [];

    const changes = added.length ? `Added coauthors: ${added.map((a) => a.username).join(', ')}` : '';
    const description = `Post '${post.title}' created. ${changes}`.trim();
    await this.postHistoryService.createOne({
      postId: post.id,
      actionType: ACTION_TYPE.POST_CREATED,
      authorId: author.id,
      description,
    });
  }

  private buildAuthorsData(mainAuthorId: number, coauthorIds: number[]): PostAuthors[] {
    return [
      { authorId: mainAuthorId, isMainAuthor: true },
      ...coauthorIds.map((id) => ({ authorId: id, isMainAuthor: false })),
    ];
  }

  public async updateOne(id: number, dto: UpdatePostDto, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    await this.postService.ensureMainAuthor(id, author.id);
    const oldPost = await this.postService.findById(id);
    let newSlug = oldPost.slug;

    if (dto.title) {
      const candidateSlug = `${slugify(dto.title)}_${randomUUID()}`;
      const isExistingSlug = await this.prisma.post.findUnique({ where: { slug: candidateSlug } });
      if (isExistingSlug) {
        throw new ConflictException(ERROR_MESSAGES.POST_SLUG_ALREADY_EXISTS);
      } else {
        newSlug = candidateSlug;
      }
    }

    const updatedPost = await this.prisma.$transaction(async () => {
      let post = oldPost;

      if (dto.title || dto.content) {
        post = await this.postService.updateContent(id, { slug: newSlug, title: dto.title, content: dto.content });
      }

      if (dto.coauthorIds) {
        const authors = this.buildPostAuthors(dto.coauthorIds, author.id);
        await this.postService.updateAuthors(id, authors);
        post = await this.postService.findById(id);
      }

      return post;
    });

    const changes = await this.getUpdateChanges(oldPost, updatedPost);
    if (changes.length) {
      await this.postHistoryService.createOne({
        postId: updatedPost.id,
        actionType: ACTION_TYPE.POST_UPDATED,
        authorId: author.id,
        description: `Post '${updatedPost.title}' was updated; ${changes.join('; ')}`,
      });
    }

    return updatedPost;
  }

  private async getUpdateChanges(
    oldPost: PostModel & { authors: PostAuthor[] },
    newPost: PostModel & { authors: PostAuthor[] },
  ): Promise<string[]> {
    const changes: string[] = [];

    if (oldPost.title !== newPost.title) {
      changes.push(`Title changed from "${oldPost.title}" to "${newPost.title}"`);
    }
    if (oldPost.content !== newPost.content) {
      changes.push('Content changed');
    }

    const oldCoauthors = oldPost.authors.map((a) => a.authorId);
    const newCoauthors = newPost.authors.map((a) => a.authorId);

    const added = newCoauthors.filter((id) => !oldCoauthors.includes(id));
    const removed = oldCoauthors.filter((id) => !newCoauthors.includes(id));

    if (added.length) {
      const authors = await this.postService.getAuthorsByIds(added);
      const addedAuthorsUsernames = authors.map((a) => a.username).join(', ');
      changes.push(`Added coauthors: ${addedAuthorsUsernames}`);
    }
    if (removed.length) {
      const authors = await this.postService.getAuthorsByIds(removed);
      const removedAuthorsUsernames = authors.map((a) => a.username).join(', ');
      changes.push(`Removed coauthors: ${removedAuthorsUsernames}`);
    }

    return changes;
  }

  public async deleteOne(where: Prisma.PostWhereUniqueInput, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    await this.ensureIsMainAuthor(where, author.id);

    return this.prisma.post.delete({ where });
  }

  public async ensureIsMainAuthor(where: Prisma.PostWhereUniqueInput, authorId: number): Promise<void> {
    const post = await this.findPostWithAuthors(where);
    const mainAuthor = post.authors.find((a) => a.isMainAuthor)!;

    if (mainAuthor.authorId !== authorId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_POST_AUTHOR);
    }
  }

  private getUniqueCoauthorIds(coauthorIds: number[] | undefined, authorId: number): number[] {
    return coauthorIds ? Array.from(new Set(coauthorIds.filter((id) => id !== authorId))) : [];
  }

  public async findPost(where: Prisma.PostWhereUniqueInput): Promise<PostModel> {
    const post = await this.prisma.post.findUnique({ where });

    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    return post;
  }

  public async findPostWithAuthors(where: Prisma.PostWhereUniqueInput): Promise<PostModel & { authors: PostAuthor[] }> {
    const post = await this.prisma.post.findUnique({
      where,
      include: {
        authors: { include: { author: true } },
        postViewAggregation: true,
        commentAggregation: true,
      },
    });

    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    return post;
  }
}

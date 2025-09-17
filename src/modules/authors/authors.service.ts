/* eslint-disable no-underscore-dangle */
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, PostStatus, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { FileService } from '@/shared/services/file/file.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { POST_STATUS, POST_STATUS_LABEL } from '../posts/constants/post';
import { PostQueryParamsDto } from '../posts/dto/post-query-params.dto';
import { PostStatuses } from '../posts/interfaces/post-statuses';
import { PostsService } from '../posts/services/posts.service';
import { AVATAR_OPTIONS } from '../profiles/constants/images-options';
import { UserWithProfileAndAuthor } from '../users/types/user.type';
import { AuthorQueryParamsDto } from './dto/author-query-params.dto';
import { AuthorContributions } from './interfaces/author-contributions';

@Injectable()
export class AuthorsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly fileService: FileService,
  ) {
    super(prisma);
  }

  public async getAll(params: AuthorQueryParamsDto): Promise<PaginatedResponse<Author>> {
    const conditions: Prisma.AuthorWhereInput[] = [];

    this.addAuthorSearchCondition(conditions, params);

    const finalWhere: Prisma.AuthorWhereInput = conditions.length > 1 ? { AND: conditions } : conditions[0];

    const args: Prisma.AuthorFindManyArgs = {
      where: finalWhere,
      orderBy: { [params.sortBy]: params.sortOrder || 'desc' },
    };
    return super.getPaginatedResult<Author, Prisma.AuthorFindManyArgs>({
      model: this.prisma.author,
      args,
      page: params.page,
      limit: params.limit,
    });
  }

  private addAuthorSearchCondition(
    conditions: Prisma.AuthorWhereInput[],
    params: AuthorQueryParamsDto,
  ): Prisma.AuthorWhereInput[] {
    if (!params.search || !params.searchField) {
      return conditions;
    }

    switch (params.searchField) {
      case Prisma.AuthorScalarFieldEnum.username:
        conditions.push({ username: { contains: params.search, mode: 'insensitive' } });
        break;
      default:
        break;
    }

    return conditions;
  }

  public async getOne(where: Prisma.AuthorWhereUniqueInput): Promise<Author> {
    return this.findAuthor({ where });
  }

  public async getAuthorPostStatuses(
    username: string,
    params: PostQueryParamsDto,
    meAuthorUsername: string,
  ): Promise<PostStatuses[]> {
    const conditions: Prisma.PostWhereInput[] = [];
    if (meAuthorUsername === username && params.status && params.status.length) {
      conditions.push({ status: { in: params.status } });
    } else if (meAuthorUsername !== username) {
      conditions.push({ status: POST_STATUS.APPROVED });
    }

    this.postsService.addPostSearchConditions(conditions, params);

    conditions.push({
      authors: {
        some: {
          author: { username },
          ...(params.isMainAuthor !== undefined && { isMainAuthor: params.isMainAuthor }),
        },
      },
    });

    const finalWhere: Prisma.PostWhereInput = conditions.length > 1 ? { AND: conditions } : conditions[0];

    const result = await this.prisma.post.groupBy({
      by: ['status'],
      _count: { status: true },
      where: finalWhere,
    });

    return Object.values(PostStatus)

      .map((status) => ({
        name: status,
        count: result.find((item) => item.status === status)?._count.status ?? 0,
        label: POST_STATUS_LABEL[status],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public async getAuthorContributionStats(
    username: string,
    params: PostQueryParamsDto,
    meAuthorUsername: string,
  ): Promise<AuthorContributions[]> {
    const authorConditions: Prisma.AuthorWhereInput[] = [];
    const postConditions: Prisma.PostWhereInput[] = [];

    if (meAuthorUsername === username && params.status && params.status.length) {
      postConditions.push({ status: { in: params.status } });
    } else if (meAuthorUsername !== username) {
      postConditions.push({ status: POST_STATUS.APPROVED });
    }

    this.postsService.addPostSearchConditions(postConditions, params);
    authorConditions.push({ username });

    const finalPostWhere: Prisma.PostWhereInput =
      postConditions.length > 1 ? { AND: postConditions } : postConditions[0];
    const finalAuthorWhere: Prisma.AuthorWhereInput =
      authorConditions.length > 1 ? { AND: authorConditions } : authorConditions[0];

    const result = await this.prisma.postAuthor.groupBy({
      by: ['isMainAuthor'],
      _count: { isMainAuthor: true },
      where: { post: finalPostWhere, author: finalAuthorWhere },
    });

    const mainAuthorCount = result.find((r) => r.isMainAuthor)?._count.isMainAuthor ?? 0;
    const coAuthorCount = result.find((r) => !r.isMainAuthor)?._count.isMainAuthor ?? 0;
    const totalCount = mainAuthorCount + coAuthorCount;

    return [
      { label: 'All', count: totalCount, value: undefined },
      { label: 'As author', count: mainAuthorCount, value: true },
      { label: 'As coauthor', count: coAuthorCount, value: false },
    ];
  }

  public async createOne(
    data: Prisma.AuthorCreateManyInput,
    currentUser: UserWithProfileAndAuthor | null,
    avatar?: Express.Multer.File,
  ): Promise<Author> {
    if (!currentUser?.profile) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    if (currentUser?.author) {
      throw new ConflictException(ERROR_MESSAGES.AUTHOR_EXISTS);
    }

    if (!data.username) {
      await this.ensureUsernameAvailable(data.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;
    const newAuthor = await this.prisma.author.create({ data: { ...data, avatarUrl, userId: currentUser?.id } });
    return newAuthor;
  }

  public async updateOne(
    data: Prisma.AuthorUpdateManyMutationInput,
    where: Prisma.AuthorWhereUniqueInput,
    avatar?: Express.Multer.File,
  ): Promise<Author> {
    await this.findAuthor({ where });

    if (data.username) {
      await this.ensureUsernameAvailable(String(data.username));
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    return this.prisma.author.update({
      where,
      data: !avatarUrl ? { ...data } : { ...data, avatarUrl },
    });
  }

  public async deleteOne(where: Prisma.AuthorWhereUniqueInput): Promise<Author> {
    await this.findAuthor({ where });
    return this.prisma.author.delete({ where });
  }

  private async findAuthor(options: Prisma.AuthorFindUniqueArgs): Promise<Author> {
    const author = await this.prisma.author.findUnique(options);

    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    return author;
  }

  public async checkAvailableUsername(username: string): Promise<boolean> {
    const result = await this.prisma.author.findFirst({ where: { username } });
    return !result;
  }

  private async ensureUsernameAvailable(username: string): Promise<void> {
    const result = await this.checkAvailableUsername(username);
    if (!result) {
      throw new ConflictException(ERROR_MESSAGES.USERNAME_EXISTS);
    }
  }
}

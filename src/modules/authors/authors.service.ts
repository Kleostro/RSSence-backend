import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, Post as AuthorPost } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { FileService } from '@/shared/services/file/file.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { POST_STATUS } from '../posts/constants/post';
import { AVATAR_OPTIONS } from '../profiles/constants/images-options';
import { FullUserInfoType } from '../users/types/types';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly fileService: FileService,
  ) {
    super(prisma, 'id', 'username');
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<Author>> {
    return super.getPaginatedResult<Author>({
      model: this.prisma.author,
      params,
    });
  }

  public async getOne(username: string): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { username } });
  }

  public async getAuthorPostStatuses(username: string): Promise<{ name: string; count: number }[]> {
    const result = await this.prisma.post.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        authors: {
          some: {
            author: {
              username,
            },
          },
        },
      },
    });

    return result
      .sort((a, b) => a.status.localeCompare(b.status))
      .map(({ status, _count }) => ({ name: status, count: _count.status }));
  }

  public async getAuthorContributionStats(
    username: string,
  ): Promise<{ label: string; count: number; value: string }[]> {
    const [totalPosts, mainAuthorCount, coAuthorCount] = await Promise.all([
      this.prisma.post.count({ where: { status: POST_STATUS.APPROVED, authors: { some: { author: { username } } } } }),
      this.prisma.post.count({
        where: { status: POST_STATUS.APPROVED, authors: { some: { author: { username }, isMainAuthor: true } } },
      }),
      this.prisma.post.count({
        where: { status: POST_STATUS.APPROVED, authors: { some: { author: { username }, isMainAuthor: false } } },
      }),
    ]);

    return [
      { label: 'All', count: totalPosts, value: 'All' },
      { label: 'As author', count: mainAuthorCount, value: 'Author' },
      { label: 'As coauthor', count: coAuthorCount, value: 'Coauthor' },
    ];
  }

  public async getAuthorPosts(username: string, params: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    let additionalWhere: Record<string, unknown> = {
      authors: { some: { author: { username } } },
      status: POST_STATUS.APPROVED,
    };
    const include = { authors: { include: { author: true } } };

    if (params.filterField === 'status' && params.filter) {
      additionalWhere = { authors: { some: { author: { username } } }, status: params.filter };
    }

    if (params.filterField === 'isMainAuthor') {
      const isMainAuthor = params.filter === 'Author';
      additionalWhere = { authors: { some: { author: { username }, isMainAuthor } }, status: POST_STATUS.APPROVED };
    }

    if (params.filterField === 'createdAt') {
      additionalWhere = {
        authors: { some: { author: { username } } },
        status: POST_STATUS.APPROVED,
        createdAt: { gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      };
    }

    return super.getPaginatedResult<AuthorPost>({
      model: this.prisma.post,
      params,
      additionalWhere,
      include,
    });
  }

  public async createOne(
    dto: CreateAuthorDto,
    currentUser: FullUserInfoType,
    avatar?: Express.Multer.File,
  ): Promise<Author> {
    const { profile, author } = currentUser;

    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    if (author) {
      throw new ConflictException(ERROR_MESSAGES.AUTHOR_EXISTS);
    }

    if (!dto.username) {
      await this.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    return this.prisma.author.create({
      data: {
        ...dto,
        avatarUrl,
        userId: currentUser.id,
      },
    });
  }

  public async updateOne(dto: UpdateAuthorDto, username: string, avatar?: Express.Multer.File): Promise<Author> {
    const author = await this.ensureAuthorExists(username);

    if (dto.username) {
      await this.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    if (!avatarUrl) {
      return this.prisma.author.update({ where: { username: author.username }, data: { ...dto } });
    }

    return this.prisma.author.update({ where: { username: author.username }, data: { ...dto, avatarUrl } });
  }

  public async deleteOne(username: string): Promise<Author> {
    const author = await this.ensureAuthorExists(username);
    return this.prisma.author.delete({ where: { username: author.username } });
  }

  private hasAuthor(username: string): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { username } });
  }

  private async ensureAuthorExists(username: string): Promise<Author> {
    const hasAuthor = await this.hasAuthor(username);
    if (!hasAuthor) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    return hasAuthor;
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    const result = await this.prisma.author.findFirst({ where: { username } });
    return !result;
  }

  private async ensureUsernameAvailable(username?: string): Promise<void> {
    const result = await this.checkAvailableUsername(username);
    if (!result) {
      throw new ConflictException(ERROR_MESSAGES.USERNAME_EXISTS);
    }
  }
}

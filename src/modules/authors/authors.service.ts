import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, Post as AuthorPost } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { FileService } from '@/shared/services/file/file.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

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

  public async getAuthorPosts(username: string, params: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return super.getPaginatedResult<AuthorPost>({
      model: this.prisma.post,
      params,
      additionalWhere: { authors: { some: { author: { username } } } },
      include: {
        authors: {
          include: { author: true },
        },
      },
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

    return this.prisma.$transaction(async (tx) => {
      const newAuthor = await tx.author.create({
        data: {
          ...dto,
          profileUsername: profile.username,
          avatarUrl,
        },
      });

      await tx.profile.update({
        where: { id: profile.id },
        data: { authorUsername: newAuthor.username },
      });

      return newAuthor;
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
    return this.prisma.$transaction(async (tx) => {
      const mainPosts = await tx.postAuthor.findMany({
        where: {
          authorUsername: author.username,
          isMainAuthor: true,
        },
        select: { postId: true },
      });

      const postIds = mainPosts.map((p) => p.postId);
      if (postIds.length > 0) {
        await tx.post.deleteMany({ where: { id: { in: postIds } } });
      }

      if (author.profileUsername) {
        await tx.profile.update({
          where: { username: author.profileUsername },
          data: { authorUsername: null },
        });
      }

      const deletedAuthor = await tx.author.delete({ where: { username: author.username } });
      return deletedAuthor;
    });
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

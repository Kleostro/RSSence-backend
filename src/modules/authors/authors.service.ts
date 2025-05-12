import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, Post as AuthorPost } from '@/generated/prisma';
import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Injectable } from '@nestjs/common';

import { AVATAR_OPTIONS } from '../profiles/constants/images-options';
import { ProfilesUtilService } from '../profiles/services/profiles-util.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsUtilService } from './services/authors-util.service';

@Injectable()
export class AuthorsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly authorsUtilService: AuthorsUtilService,
    private readonly profilesUtilService: ProfilesUtilService,
  ) {
    super(prisma, 'id', 'username');
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<Author>> {
    return super.getPaginatedResult<Author>({
      model: this.prisma.author,
      params,
    });
  }

  public async getOne(authorId: number): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { id: authorId } });
  }

  public async getAuthorPosts(authorId: number, params: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return super.getPaginatedResult<AuthorPost>({
      model: this.prisma.post,
      params,
      additionalWhere: { authors: { some: { authorId } } },
      include: {
        authors: {
          include: { author: true },
        },
      },
    });
  }

  public async createOne(dto: CreateAuthorDto, userId: number, avatar?: Express.Multer.File): Promise<Author> {
    await this.profilesUtilService.ensureProfileExists(userId);

    if (!dto.username) {
      await this.profilesUtilService.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;
    return this.prisma.author.create({ data: { ...dto, userId, avatarUrl } });
  }

  public async updateOne(dto: UpdateAuthorDto, userId: number, avatar?: Express.Multer.File): Promise<Author> {
    await this.profilesUtilService.ensureProfileExists(userId);
    await this.authorsUtilService.ensureAuthorExists({ userId });

    if (dto.username) {
      await this.authorsUtilService.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    if (!avatarUrl) {
      return this.prisma.author.update({ where: { userId }, data: { ...dto } });
    }

    return this.prisma.author.update({ where: { userId }, data: { ...dto, avatarUrl } });
  }

  public async deleteOne(userId: number): Promise<Author> {
    const author = await this.authorsUtilService.ensureAuthorExists({ userId });

    const postAuthors = await this.prisma.postAuthor.findMany({
      where: { authorId: author.id },
      select: {
        postId: true,
        isMainAuthor: true,
      },
    });

    const postDeletionPromises = postAuthors
      .filter((pa) => pa.isMainAuthor)
      .map(({ postId }) =>
        this.prisma.post.delete({
          where: { id: postId },
        }),
      );

    await Promise.all(postDeletionPromises);

    await this.prisma.postAuthor.deleteMany({
      where: { authorId: author.id },
    });

    return this.prisma.author.delete({ where: { userId } });
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    return this.authorsUtilService.checkAvailableUsername(username);
  }
}

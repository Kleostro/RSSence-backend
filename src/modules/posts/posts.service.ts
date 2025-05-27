import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Post as AuthorPost } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { Injectable, NotFoundException } from '@nestjs/common';

import { FullUserInfoType } from '../users/types/types';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService extends PaginationService {
  constructor(prisma: PrismaService) {
    super(prisma, 'id', 'title');
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return super.getPaginatedResult({
      model: this.prisma.post,
      params,
      include: {
        authors: {
          include: { author: true },
        },
      },
    });
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

  public async createOne(createPostDto: CreatePostDto, currentUser: FullUserInfoType): Promise<AuthorPost> {
    const { author } = currentUser;

    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const coauthorIds = this.getUniqueCoauthorIds(createPostDto.coauthorIds, author.id);
    const coauthors = await this.prisma.author.findMany({ where: { id: { in: coauthorIds } } });

    const authorsData = [
      { authorUsername: author.username, isMainAuthor: true },
      ...coauthors.map((coauthor) => ({ authorUsername: coauthor.username, isMainAuthor: false })),
    ];

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
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
  }

  public async deleteById(postId: number): Promise<AuthorPost> {
    await this.ensurePostExists(postId);
    return this.prisma.post.delete({ where: { id: postId } });
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

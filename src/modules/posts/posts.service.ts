import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, Post as AuthorPost } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { Injectable, NotFoundException } from '@nestjs/common';

import { FullUserInfoType } from '../users/types/types';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

interface CurrentPostAuthors {
  authorUsername: string;
  isMainAuthor: boolean;
}

interface CoauthorsList {
  username: string;
  isMainAuthor: boolean;
}

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

  public async updateOne(
    postId: number,
    updatePostDto: UpdatePostDto,
    currentUser: FullUserInfoType,
  ): Promise<AuthorPost> {
    const { author } = currentUser;

    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    await this.ensurePostExists(postId);

    const newAuthors = await this.createCoauthorsList(updatePostDto.coauthorIds ?? [], author);
    const currentAuthors = await this.getCurrentPostAuthors(postId);

    const newSet = new Set(newAuthors.map((a) => a.username));
    const currentSet = new Set(currentAuthors.map((a) => a.authorUsername));
    const toRemove = currentAuthors.filter((ca) => !newSet.has(ca.authorUsername));
    const toAdd = newAuthors.filter((a) => !currentSet.has(a.username));
    return this.updateOneTransaction(postId, updatePostDto, toRemove, toAdd);
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

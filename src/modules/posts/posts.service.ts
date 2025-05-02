import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Post as ProfilePost } from '@prisma/client';

import { AuthorsUtilService } from '../authors/services/authors-util.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorsUtilService: AuthorsUtilService,
  ) {}

  public async getAll(): Promise<ProfilePost[]> {
    const posts = await this.prisma.post.findMany();

    return posts;
  }

  public async getById(postId: number): Promise<ProfilePost> {
    return this.ensurePostExists(postId);
  }

  public async getByAuthorId(authorId: number): Promise<ProfilePost[]> {
    return this.prisma.post.findMany({ where: { authorId } });
  }

  public async createOne(createPostDto: CreatePostDto, userId: number): Promise<ProfilePost> {
    const author = await this.authorsUtilService.ensureAuthorExists({ userId });
    const coauthorsIds = this.getUniqueCoauthorIds(createPostDto.coauthorIds, author.id);

    if (coauthorsIds.length > 0) {
      await this.validateCoauthors(coauthorsIds);
    }

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        imageUrls: createPostDto.imageUrls,
        author: { connect: { id: author.id } },
        coauthorsIds,
      },
    });
  }

  public async deleteById(postId: number): Promise<ProfilePost> {
    await this.ensurePostExists(postId);
    return this.prisma.post.delete({ where: { id: postId } });
  }

  private getUniqueCoauthorIds(coauthorIds: number[] | undefined, authorId: number): number[] {
    return coauthorIds ? Array.from(new Set(coauthorIds.filter((id) => id !== authorId))) : [];
  }

  private async validateCoauthors(coauthorIds: number[]): Promise<void> {
    await Promise.all(coauthorIds.map((id) => this.authorsUtilService.ensureAuthorExists({ id })));
  }

  private buildCoauthorsData(coauthorIds: number[]): { create: { author: { connect: { id: number } } }[] } | undefined {
    if (coauthorIds.length === 0) {
      return undefined;
    }

    return {
      create: coauthorIds.map((coauthorId) => ({ author: { connect: { id: coauthorId } } })),
    };
  }

  private async ensurePostExists(postId: number): Promise<ProfilePost> {
    const hasPost = await this.hasPost(postId);
    if (!hasPost) {
      throw new NotFoundException(`Post for postId ${postId} does not exist.`);
    }

    return hasPost;
  }

  private async hasPost(postId: number): Promise<ProfilePost | null> {
    const result = await this.prisma.post.findFirst({ where: { id: postId } });
    return result;
  }
}

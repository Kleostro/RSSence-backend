import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Post as ProfilePost } from '@/generated/prisma';
import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthorsUtilService } from '../authors/services/authors-util.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService extends PaginationService<ProfilePost> {
  constructor(
    prisma: PrismaService,
    private readonly authorsUtilService: AuthorsUtilService,
  ) {
    super(prisma, 'createdAt', 'title');
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<ProfilePost>> {
    return super.getPaginatedResult(this.prisma.post, params);
  }

  public async getById(postId: number): Promise<ProfilePost> {
    return this.ensurePostExists(postId);
  }

  public async getByAuthorId(authorId: number, params: QueryParamsDto): Promise<PaginatedResponse<ProfilePost>> {
    return super.getPaginatedResult(this.prisma.post, params, { authorId });
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

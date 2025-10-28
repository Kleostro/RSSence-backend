import { Author, PostAuthor, PostStatus } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  public async findById(id: number): Promise<PostModel & { authors: PostAuthor[] }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { authors: { include: { author: true } } },
    });
    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }
    return post;
  }

  public async ensureMainAuthor(postId: number, authorId: number): Promise<void> {
    const post = await this.findById(postId);
    const mainAuthor = post.authors.find((a) => a.isMainAuthor);
    if (!mainAuthor || mainAuthor.authorId !== authorId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_POST_AUTHOR);
    }
  }

  public async updateStatus(id: number, status: PostStatus): Promise<PostModel> {
    return this.prisma.post.update({
      where: { id },
      data: { status },
      include: { authors: { include: { author: true } } },
    });
  }

  public async updateContent(
    id: number,
    data: { slug: string | null; title?: string; content?: string },
  ): Promise<PostModel & { authors: PostAuthor[] }> {
    return this.prisma.post.update({
      where: { id },
      data,
      include: { authors: { include: { author: true } } },
    });
  }

  public async updateAuthors(
    id: number,
    authorsData: { authorId: number; isMainAuthor: boolean }[],
  ): Promise<PostModel> {
    return this.prisma.$transaction(async (tx) => {
      await tx.postAuthor.deleteMany({ where: { postId: id } });
      await tx.postAuthor.createMany({ data: authorsData.map((a) => ({ ...a, postId: id })) });
      return tx.post.findUniqueOrThrow({
        where: { id },
        include: { authors: { include: { author: true } } },
      });
    });
  }

  public async getAuthorsByIds(authorIds: number[]): Promise<Author[]> {
    if (!authorIds.length) {
      return [];
    }
    return this.prisma.author.findMany({
      where: { id: { in: authorIds } },
    });
  }
}

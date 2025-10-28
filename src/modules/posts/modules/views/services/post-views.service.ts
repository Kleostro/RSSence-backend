import { PostAuthor, PostView } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostViewsService {
  constructor(private readonly prisma: PrismaService) {}

  public async createOne(postId: number, userId: number): Promise<PostView> {
    return this.prisma.postView.create({
      data: { postId, userId },
    });
  }

  public isPostAuthorViewed(post: PostModel & { authors: PostAuthor[] }, authorId?: number): boolean {
    if (!authorId) {
      return false;
    }

    const postAuthorsIds = post.authors.map((a) => a.authorId);
    return postAuthorsIds.includes(authorId);
  }
}

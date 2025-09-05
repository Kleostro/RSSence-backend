import { Post as AuthorPost, PostActionType, PostHistory } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { CoauthorsList, CurrentPostAuthors } from '../../interfaces/post-authors';

@Injectable()
export class PostLogService {
  constructor(private readonly prisma: PrismaService) {}

  public async logPostEvent(
    post: AuthorPost,
    actionType: PostActionType,
    authorId: number,
    description?: string,
  ): Promise<PostHistory> {
    return this.prisma.postHistory.create({
      data: {
        postId: post.id,
        authorId,
        actionType,
        description,
      },
    });
  }

  public getPostDiff(oldPost: AuthorPost, newPost: AuthorPost): string[] {
    const changes: string[] = [];

    if (oldPost.title !== newPost.title) {
      changes.push(`Title changed from "${oldPost.title}" to "${newPost.title}"`);
    }

    if (oldPost.content !== newPost.content) {
      changes.push(`Content changed.`);
    }

    return changes;
  }

  public getCoauthorsDiff(
    oldAuthors: CurrentPostAuthors[],
    newCoauthors: CoauthorsList[],
  ): { added: number[]; removed: number[] } {
    const oldSet = new Set(oldAuthors.map((a) => a.authorId));
    const newSet = new Set(newCoauthors.map((a) => a.id));

    const added = [...newSet].filter((u) => !oldSet.has(u));
    const removed = [...oldSet].filter((u) => !newSet.has(u));

    return { added, removed };
  }
}

import { PostAuthor } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { PrismaService } from '@/prisma/prisma.service';
import { TIME } from '@/shared/constants/time';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostViewCurrentDayService {
  constructor(private readonly prisma: PrismaService) {}

  public async getCurrentDayStats(post: PostModel & { authors: PostAuthor[] }): Promise<{
    uniqueViewsToday: number;
    totalViewsToday: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart.getTime() + TIME.DAY);

    const views = await this.prisma.postView.findMany({
      where: {
        postId: post.id,
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    const postAuthorIds = post.authors.map((pa) => pa.authorId);
    const userIdsByAuthors = await this.prisma.author.findMany({
      where: { id: { in: postAuthorIds } },
      select: { userId: true },
    });

    const authorUserIds = new Set<number>(
      userIdsByAuthors.map((a) => a.userId).filter((id): id is number => id !== null),
    );

    let totalViewsToday = 0;
    const uniqueUserIds = new Set<number>();

    views.forEach((view) => {
      totalViewsToday += 1;
      if (!authorUserIds.has(view.userId)) {
        uniqueUserIds.add(view.userId);
      }
    });

    return {
      uniqueViewsToday: uniqueUserIds.size,
      totalViewsToday,
    };
  }
}

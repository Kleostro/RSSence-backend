import { Author, Post, PostView } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

type PostViewWithPostAndAuthors = PostView & { post: Post & { authors: { author: Author }[] } };

@Injectable()
export class PostViewDailyStatsService {
  constructor(private readonly prisma: PrismaService) {}

  public async generateDailyStats(forDate: Date = new Date()): Promise<void> {
    const yesterday = this.getYesterdayStart(forDate);
    const tomorrow = this.getNextDayStart(yesterday);

    const allViews = await this.getAllViewsForDay(yesterday, tomorrow);
    const dailyStats = this.aggregateDailyStats(allViews, yesterday);
    await this.saveDailyStats(dailyStats, yesterday);
  }

  private getYesterdayStart(forDate: Date): Date {
    const utcDate = new Date(forDate.getTime() + forDate.getTimezoneOffset() * 60 * 1000);
    const yesterday = new Date(utcDate);
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return yesterday;
  }

  private getNextDayStart(date: Date): Date {
    return new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  private async getAllViewsForDay(start: Date, end: Date): Promise<PostViewWithPostAndAuthors[]> {
    return this.prisma.postView.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { post: { include: { authors: { include: { author: true } } } } },
    });
  }

  private buildAuthorUserIdsMap(views: PostViewWithPostAndAuthors[]): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();

    views.forEach((view) => {
      const { postId } = view;
      if (!map.has(postId)) {
        const authorUserIds = view.post.authors.map((pa) => pa.author.userId).filter((id): id is number => id !== null);
        map.set(postId, new Set(authorUserIds));
      }
    });

    return map;
  }

  private aggregateDailyStats(
    views: PostViewWithPostAndAuthors[],
    date: Date,
  ): { postId: number; date: Date; uniqueViews: number; totalViews: number }[] {
    const dailyStatsMap = new Map<string, { postId: number; date: Date; uniqueViews: number; totalViews: number }>();
    const uniqueUsersMap = new Map<string, Set<number>>();

    views.forEach((view) => {
      const dateStr = view.createdAt.toISOString().split('T')[0];
      const key = `${view.postId}-${dateStr}`;

      if (!dailyStatsMap.has(key)) {
        dailyStatsMap.set(key, {
          postId: view.postId,
          date,
          uniqueViews: 0,
          totalViews: 0,
        });
      }

      dailyStatsMap.get(key)!.totalViews += 1;
    });

    const authorUserIdsMap = this.buildAuthorUserIdsMap(views);

    views.forEach((view) => {
      const dateStr = view.createdAt.toISOString().split('T')[0];
      const key = `${view.postId}-${dateStr}`;

      const authorUserIds = authorUserIdsMap.get(view.postId);
      if (authorUserIds && !authorUserIds.has(view.userId)) {
        if (!uniqueUsersMap.has(key)) {
          uniqueUsersMap.set(key, new Set<number>());
        }
        uniqueUsersMap.get(key)!.add(view.userId);
      }
    });

    return Array.from(dailyStatsMap.values()).map((stat) => ({
      ...stat,
      uniqueViews: uniqueUsersMap.get(`${stat.postId}-${stat.date.toISOString().split('T')[0]}`)?.size || 0,
    }));
  }

  private async saveDailyStats(
    dailyStats: { postId: number; date: Date; uniqueViews: number; totalViews: number }[],
    date: Date,
  ): Promise<void> {
    await this.prisma.postViewDailyStats.deleteMany({
      where: { date },
    });

    const inserts = dailyStats.map((stat) => ({
      postId: stat.postId,
      date,
      uniqueViews: stat.uniqueViews,
      totalViews: stat.totalViews,
    }));

    if (inserts.length) {
      await this.prisma.postViewDailyStats.createMany({
        data: inserts,
        skipDuplicates: true,
      });
    }
  }
}

import { Post, PostStatus, PostView } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { TIME } from '@/shared/constants/time';
import { Injectable } from '@nestjs/common';

type PostViewWithPost = PostView & { post: Post };

@Injectable()
export class PostViewDailyStatsService {
  constructor(private readonly prisma: PrismaService) {}

  public async getPostViewTrend(
    postId: number,
    start?: Date,
    end?: Date,
  ): Promise<{ uniqueViews: number; totalViews: number; date: Date }[]> {
    let parseStart = start;
    let parseEnd = end;

    if (!parseStart) {
      const now = new Date();
      parseStart = new Date(now.getTime() - TIME.WEEK);
      parseStart.setUTCHours(0, 0, 0, 0);
    }
    if (!parseEnd) {
      parseEnd = new Date();
      parseEnd.setUTCHours(23, 59, 59, 999);
    }

    return this.prisma.postViewDailyStats.findMany({
      where: { postId, date: { gte: parseStart, lte: parseEnd } },
      orderBy: { date: 'asc' },
      select: { date: true, uniqueViews: true, totalViews: true },
    });
  }

  public async generateDailyStats(forDate: Date = new Date()): Promise<void> {
    const yesterday = this.getYesterdayStart(forDate);
    const tomorrow = this.getNextDayStart(yesterday);

    const allViews = await this.getAllViewsForDay(yesterday, tomorrow);
    const dailyStatsFromViews = this.aggregateDailyStats(allViews, yesterday);

    const activePosts = await this.prisma.post.findMany({
      where: { createdAt: { lte: yesterday }, status: PostStatus.APPROVED },
      select: { id: true },
    });

    const postIdsFromViews = new Set(dailyStatsFromViews.map((stat) => stat.postId));
    const zeroStats: { postId: number; date: Date; uniqueViews: number; totalViews: number }[] = [];

    activePosts.forEach((post) => {
      if (!postIdsFromViews.has(post.id)) {
        zeroStats.push({
          postId: post.id,
          date: yesterday,
          uniqueViews: 0,
          totalViews: 0,
        });
      }
    });

    const allDailyStats = [...dailyStatsFromViews, ...zeroStats];
    await this.saveDailyStats(allDailyStats, yesterday);
  }

  private getYesterdayStart(forDate: Date): Date {
    const utcDate = new Date(forDate.getTime() + forDate.getTimezoneOffset() * TIME.MINUTE);
    const yesterday = new Date(utcDate);
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return yesterday;
  }

  private getNextDayStart(date: Date): Date {
    return new Date(date.getTime() + TIME.DAY);
  }

  private async getAllViewsForDay(start: Date, end: Date): Promise<PostViewWithPost[]> {
    return this.prisma.postView.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { post: true },
    });
  }

  private aggregateDailyStats(
    views: PostViewWithPost[],
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

      if (!uniqueUsersMap.has(key)) {
        uniqueUsersMap.set(key, new Set<number>());
      }
      uniqueUsersMap.get(key)!.add(view.userId);
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
    await this.prisma.postViewDailyStats.deleteMany({ where: { date } });

    if (dailyStats.length) {
      await this.prisma.postViewDailyStats.createMany({
        data: dailyStats,
        skipDuplicates: true,
      });
    }
  }
}

import { Comment, PostStatus } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { TIME } from '@/shared/constants/time';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentDailyStatsService {
  constructor(private readonly prisma: PrismaService) {}

  public async getCommentTrend(
    postId: number,
    start?: Date,
    end?: Date,
  ): Promise<{ totalComments: number; activeComments: number; date: Date }[]> {
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

    return this.prisma.commentDailyStats.findMany({
      where: { postId, date: { gte: parseStart, lte: parseEnd } },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        totalComments: true,
        activeComments: true,
      },
    });
  }

  public async generateDailyStats(forDate: Date = new Date()): Promise<void> {
    const yesterday = this.getYesterdayStart(forDate);
    const tomorrow = this.getNextDayStart(yesterday);

    const allComments = await this.getAllCommentsForDay(yesterday, tomorrow);
    const dailyStatsFromComments = this.aggregateDailyStats(allComments, yesterday);

    const activePosts = await this.prisma.post.findMany({
      where: { createdAt: { lte: yesterday }, status: PostStatus.APPROVED },
      select: { id: true },
    });

    const postIdsFromComments = new Set(dailyStatsFromComments.map((stat) => stat.postId));
    const zeroStats: { postId: number; date: Date; totalComments: number; activeComments: number }[] = [];

    activePosts.forEach((post) => {
      if (!postIdsFromComments.has(post.id)) {
        zeroStats.push({
          postId: post.id,
          date: yesterday,
          totalComments: 0,
          activeComments: 0,
        });
      }
    });

    const allDailyStats = [...dailyStatsFromComments, ...zeroStats];
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

  private async getAllCommentsForDay(start: Date, end: Date): Promise<Comment[]> {
    return this.prisma.comment.findMany({ where: { createdAt: { gte: start, lt: end } } });
  }

  private aggregateDailyStats(
    comments: Comment[],
    date: Date,
  ): { postId: number; date: Date; totalComments: number; activeComments: number }[] {
    const dailyStatsMap = new Map<
      string,
      { postId: number; date: Date; totalComments: number; activeComments: number }
    >();
    const uniqueUsersMap = new Map<string, Set<number>>();

    comments.forEach((comment) => {
      const dateStr = comment.createdAt.toISOString().split('T')[0];
      const key = `${comment.postId}-${dateStr}`;

      if (!dailyStatsMap.has(key)) {
        dailyStatsMap.set(key, {
          postId: comment.postId,
          date,
          totalComments: 0,
          activeComments: 0,
        });
      }

      dailyStatsMap.get(key)!.totalComments += 1;

      if (comment.isDeleted === false) {
        dailyStatsMap.get(key)!.activeComments += 1;
      }

      if (!uniqueUsersMap.has(key)) {
        uniqueUsersMap.set(key, new Set<number>());
      }
      uniqueUsersMap.get(key)!.add(comment.profileId);
    });

    return Array.from(dailyStatsMap.values());
  }

  private async saveDailyStats(
    dailyStats: { postId: number; date: Date; totalComments: number; activeComments: number }[],
    date: Date,
  ): Promise<void> {
    await this.prisma.commentDailyStats.deleteMany({ where: { date } });

    if (dailyStats.length) {
      await this.prisma.commentDailyStats.createMany({
        data: dailyStats,
        skipDuplicates: true,
      });
    }
  }
}

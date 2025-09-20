import { PostView } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostViewsService {
  constructor(private readonly prisma: PrismaService) {}

  public async getCurrentPostViews(postId: number): Promise<{ uniqueViews: number; totalViews: number } | null> {
    return this.prisma.postViewAggregation.findUnique({
      where: { postId },
      select: {
        uniqueViews: true,
        totalViews: true,
      },
    });
  }

  public async getPostViewTrend(
    postId: number,
    start?: Date,
    end?: Date,
  ): Promise<{ uniqueViews: number; totalViews: number; date: Date }[]> {
    let parseStart = start;
    let parseEnd = end;
    if (!parseStart) {
      parseStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    if (!parseEnd) {
      parseEnd = new Date();
    }

    parseStart.setHours(0, 0, 0, 0);
    parseEnd.setHours(23, 59, 59, 999);

    return this.prisma.postViewDailyStats.findMany({
      where: { postId, date: { gte: parseStart, lte: parseEnd } },
      orderBy: { date: 'asc' },
      select: { date: true, uniqueViews: true, totalViews: true },
    });
  }

  public async getAuthorViewTrend(
    authorId: number,
    start?: Date,
    end?: Date,
  ): Promise<{ uniqueViews: number; totalViews: number; date: Date }[]> {
    let parseStart = start;
    let parseEnd = end;
    if (!parseStart) {
      parseStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    if (!parseEnd) {
      parseEnd = new Date();
    }

    parseStart.setHours(0, 0, 0, 0);
    parseEnd.setHours(23, 59, 59, 999);

    return this.prisma.postViewDailyStats.findMany({
      where: {
        date: { gte: parseStart, lte: parseEnd },
        post: { authors: { some: { authorId } } },
      },
      orderBy: { date: 'asc' },
      select: { date: true, uniqueViews: true, totalViews: true },
    });
  }

  public async createOne(postId: number, userId: number): Promise<PostView> {
    return this.prisma.postView.create({
      data: { postId, userId },
    });
  }
}

import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostViewAggregationService {
  constructor(private readonly prisma: PrismaService) {}

  public async updateAllAggregations(): Promise<void> {
    const dailyStats = await this.prisma.postViewDailyStats.findMany({
      select: {
        postId: true,
        uniqueViews: true,
        totalViews: true,
      },
    });

    const aggregated = new Map<number, { uniqueViews: number; totalViews: number }>();
    dailyStats.forEach((stat) => {
      if (!aggregated.has(stat.postId)) {
        aggregated.set(stat.postId, { uniqueViews: 0, totalViews: 0 });
      }
      aggregated.get(stat.postId)!.uniqueViews += stat.uniqueViews;
      aggregated.get(stat.postId)!.totalViews += stat.totalViews;
    });

    await this.prisma.postViewAggregation.deleteMany({});

    const inserts = Array.from(aggregated.entries()).map(([postId, stats]) => ({
      postId,
      uniqueViews: stats.uniqueViews,
      totalViews: stats.totalViews,
    }));

    if (inserts.length) {
      await this.prisma.postViewAggregation.createMany({
        data: inserts,
        skipDuplicates: true,
      });
    }
  }
}

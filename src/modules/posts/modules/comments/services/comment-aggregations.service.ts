import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentAggregationService {
  constructor(private readonly prisma: PrismaService) {}

  public async updateAllAggregations(): Promise<void> {
    const dailyStats = await this.prisma.commentDailyStats.findMany();

    const aggregated = new Map<number, { totalComments: number; activeComments: number }>();
    dailyStats.forEach((stat) => {
      if (!aggregated.has(stat.postId)) {
        aggregated.set(stat.postId, { totalComments: 0, activeComments: 0 });
      }
      aggregated.get(stat.postId)!.totalComments += stat.totalComments;
      aggregated.get(stat.postId)!.activeComments += stat.activeComments;
    });

    const inserts: { postId: number; totalComments: number; activeComments: number }[] = [];
    const updates: { postId: number; totalComments: number; activeComments: number }[] = [];

    const existing = await this.prisma.commentAggregation.findMany();

    const existingPostIds = new Set(existing.map((a) => a.postId));

    Array.from(aggregated.entries()).forEach(([postId, stats]) => {
      if (existingPostIds.has(postId)) {
        updates.push({ postId, totalComments: stats.totalComments, activeComments: stats.activeComments });
      } else {
        inserts.push({ postId, totalComments: stats.totalComments, activeComments: stats.activeComments });
      }
    });

    if (inserts.length) {
      await this.prisma.commentAggregation.createMany({ data: inserts, skipDuplicates: true });
    }

    if (updates.length) {
      await Promise.all(
        updates.map((update) =>
          this.prisma.commentAggregation.update({
            where: { postId: update.postId },
            data: { totalComments: update.totalComments, activeComments: update.activeComments, updatedAt: new Date() },
          }),
        ),
      );
    }
  }
}

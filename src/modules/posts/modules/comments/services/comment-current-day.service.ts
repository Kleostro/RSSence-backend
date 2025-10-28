import { Post } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { TIME } from '@/shared/constants/time';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentCurrentDayService {
  constructor(private readonly prisma: PrismaService) {}

  public async getCurrentDayStats(post: Post): Promise<{
    totalCommentsToday: number;
    activeCommentsToday: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart.getTime() + TIME.DAY);

    const comments = await this.prisma.comment.findMany({
      where: {
        postId: post.id,
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    let totalCommentsToday = 0;
    let activeCommentsToday = 0;

    comments.forEach((comment) => {
      totalCommentsToday += 1;

      if (!comment.isDeleted) {
        activeCommentsToday += 1;
      }
    });

    return {
      totalCommentsToday,
      activeCommentsToday,
    };
  }
}

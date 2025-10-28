import { PostModel } from '@/generated/prisma/models';

export interface FullPostAnalytics extends Partial<PostModel> {
  currentDayCommentsStats: {
    activeCommentsToday: number;
    totalCommentsToday: number;
  };
  currentDayViewStats: {
    uniqueViewsToday: number;
    totalViewsToday: number;
  };
}

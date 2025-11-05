import { ModerationHistory, PostHistory } from '@/generated/prisma';
import { PostHistoryService } from '@/modules/posts/modules/history/services/post-history.service';
import { Injectable } from '@nestjs/common';

import { PostModerationService } from '../../moderation/services/post-moderation.service';

@Injectable()
export class PostAuditService {
  constructor(
    private postHistoryService: PostHistoryService,
    private moderationHistoryService: PostModerationService,
  ) {}

  public async getHistory(postId: number): Promise<(PostHistory | ModerationHistory)[]> {
    const [postHist, modHist] = await Promise.all([
      this.postHistoryService.getAll({ postId }),
      this.moderationHistoryService.getAll({ targetId: postId }),
    ]);

    return [...postHist, ...modHist].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

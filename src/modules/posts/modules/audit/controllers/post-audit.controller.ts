import { ModerationHistory, PostHistory } from '@/generated/prisma';
import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';

import { PostAuditService } from '../services/post-audit.service';

@UseGuards(JwtAccessGuard)
@Controller('posts/:postId/audit')
export class PostAuditController {
  constructor(private readonly postAuditService: PostAuditService) {}

  @Get('full-history')
  public async getFullHistory(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<(ModerationHistory | PostHistory)[]> {
    return this.postAuditService.getFullHistory(postId);
  }
}

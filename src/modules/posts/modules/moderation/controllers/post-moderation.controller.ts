import { RoleGuard } from '@/core/guards/role.guard';
import { Author, Moderator } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { PostAuthorActionDto } from '@/modules/posts/modules/moderation/dto/post-author-action.dto';
import { PostModeratorActionDto } from '@/modules/posts/modules/moderation/dto/post-moderator-action.dto';
import { ROLES } from '@/shared/constants/roles';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Body, Controller, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';

import { PostModerationService } from '../services/post-moderation.service';

@UseGuards(JwtAccessGuard)
@Controller('posts/:postId/moderation')
export class PostModerationController {
  constructor(private readonly postModerationService: PostModerationService) {}

  @Patch()
  public async performAuthorAction(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('author') author: Author,
    @Body() dto: PostAuthorActionDto,
  ): Promise<PostModel> {
    return this.postModerationService.performAuthorAction(postId, dto.action, author);
  }

  @UseGuards(RoleGuard)
  @Roles(ROLES.MODERATOR)
  @Patch('moderator')
  public async performModeratorAction(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('moderator') moderator: Moderator,
    @Body() dto: PostModeratorActionDto,
  ): Promise<PostModel> {
    return this.postModerationService.performModeratorAction(postId, dto.action, moderator, dto.comment, dto.reasons);
  }
}

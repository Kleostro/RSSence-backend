import { PostModel } from '@/generated/prisma/models';
import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { POST_ACCESS_LEVEL } from '@/modules/posts/constants/post';
import { PostAuthorActionDto } from '@/modules/posts/modules/moderation/dto/post-author-action.dto';
import { PostModeratorActionDto } from '@/modules/posts/modules/moderation/dto/post-moderator-action.dto';
import { FullUser } from '@/modules/users/types/user.type';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, ForbiddenException, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';

import { PostsAccessService } from '../../../services/posts-access.service';
import { PostModerationService } from '../services/post-moderation.service';

@UseGuards(JwtAccessGuard)
@Controller('posts/:postId/moderation')
export class PostModerationController {
  constructor(
    private readonly postModerationService: PostModerationService,
    private readonly postsAccessService: PostsAccessService,
  ) {}

  @Patch()
  public async performAuthorAction(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: FullUser | null,
    @Body() dto: PostAuthorActionDto,
  ): Promise<PostModel> {
    const hasAccess = await this.postsAccessService.hasAccess(user, { id: postId }, POST_ACCESS_LEVEL.AUTHOR_ONLY);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.postModerationService.performAuthorAction(postId, dto.action, user?.author);
  }

  @Patch('moderator')
  public async performModeratorAction(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: FullUser | null,
    @Body() dto: PostModeratorActionDto,
  ): Promise<PostModel> {
    const hasAccess = await this.postsAccessService.hasAccess(
      user,
      { id: postId },
      POST_ACCESS_LEVEL.MODERATOR_OR_HIGHER,
    );

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.postModerationService.performModeratorAction(
      postId,
      dto.action,
      user?.moderator,
      dto.comment,
      dto.reasons,
    );
  }
}

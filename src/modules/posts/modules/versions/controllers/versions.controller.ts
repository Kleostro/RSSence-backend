import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PostVersion } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { POST_ACCESS_LEVEL } from '@/modules/posts/constants/post';
import { PostVersionDiff } from '@/modules/posts/modules/versions/dto/post-version-diff';
import { PostsAccessService } from '@/modules/posts/services/posts-access.service';
import { FullUser } from '@/modules/users/types/user.type';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { VersionsService } from '../services/versions.service';

@UseGuards(JwtAccessGuard)
@Controller('posts/:postId/versions')
export class PostVersionsController {
  constructor(
    private postsAccessService: PostsAccessService,
    private readonly versionsService: VersionsService,
  ) {}

  @Get()
  public async getVersionsByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: QueryParamsDto,
    @CurrentUser() user: FullUser | null,
  ): Promise<PaginatedResponse<PostVersion>> {
    const hasAccess = await this.postsAccessService.hasAccess(
      user,
      { id: postId },
      POST_ACCESS_LEVEL.AUTHOR_OR_MODERATOR,
    );
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return this.versionsService.getVersionsByPost(postId, query);
  }

  @Post(':version/revert')
  public async revertToVersion(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser() user: FullUser | null,
  ): Promise<PostModel> {
    const hasAccess = await this.postsAccessService.hasAccess(
      user,
      { id: postId },
      POST_ACCESS_LEVEL.MAIN_AUTHOR_OR_MODERATOR,
    );
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return this.versionsService.revertToVersion(postId, version, user?.author);
  }

  @Delete(':version')
  public async deletePostVersion(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser() user: FullUser | null,
  ): Promise<PostVersion> {
    const hasAccess = await this.postsAccessService.hasAccess(
      user,
      { id: postId },
      POST_ACCESS_LEVEL.MAIN_AUTHOR_OR_MODERATOR,
    );
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return this.versionsService.deletePostVersion(postId, version);
  }

  @Get('version-diff')
  public async comparePostVersions(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
    @CurrentUser() user: FullUser | null,
  ): Promise<PostVersionDiff> {
    const hasAccess = await this.postsAccessService.hasAccess(
      user,
      { id: postId },
      POST_ACCESS_LEVEL.AUTHOR_OR_MODERATOR,
    );
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return this.versionsService.comparePostVersions(postId, from, to);
  }
}

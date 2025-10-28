import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Author, PostVersion } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { PostVersionDiff } from '@/modules/posts/modules/versions/dto/post-version-diff';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { VersionsService } from '../services/versions.service';

@UseGuards(JwtAccessGuard)
@Controller('posts/:postId/versions')
export class PostVersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  public async getVersionsByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: QueryParamsDto,
  ): Promise<PaginatedResponse<PostVersion>> {
    return this.versionsService.getVersionsByPost(postId, query);
  }

  @Post(':version/revert')
  public async revertToVersion(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser('author') author: Author,
  ): Promise<PostModel> {
    return this.versionsService.revertToVersion(postId, version, author);
  }

  @Delete(':version')
  public async deletePostVersion(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('version', ParseIntPipe) version: number,
  ): Promise<PostVersion> {
    return this.versionsService.deletePostVersion(postId, version);
  }

  @Get('version-diff')
  public async comparePostVersions(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<PostVersionDiff> {
    return this.versionsService.comparePostVersions(postId, from, to);
  }
}

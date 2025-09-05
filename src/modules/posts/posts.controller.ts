import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { RoleGuard } from '@/core/guards/role.guard';
import { Author, Post as AuthorPost, ModerationHistory, Moderator, PostHistory, PostVersion } from '@/generated/prisma';
import { ROLES } from '@/shared/constants/roles';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostVersionDiff } from './interfaces/post-version-diff';
import { PostsService } from './posts.service';

@UseGuards(JwtAccessGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  public async getAll(@Query() query: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return this.postsService.getAll(query);
  }

  @UseGuards(RoleGuard)
  @Roles(ROLES.MODERATOR)
  @Get('moderation')
  public async getSubmittedForModeration(@Query() query: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return this.postsService.getSubmittedForModeration(query);
  }

  @Get(':id')
  public async getById(@Param('id', ParseIntPipe) postId: number): Promise<AuthorPost | null> {
    return this.postsService.getById(postId);
  }

  @Patch(':id/submit')
  public async submitForModeration(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('author') author: Author,
  ): Promise<AuthorPost> {
    return this.postsService.submitForModeration(postId, author);
  }

  @Patch(':id/draft')
  public async saveAsDraft(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('author') author: Author,
  ): Promise<AuthorPost> {
    return this.postsService.saveAsDraft(postId, author);
  }

  @Post(':id/revert')
  public async revertToVersion(
    @Param('id', ParseIntPipe) postId: number,
    @Body('version', ParseIntPipe) version: number,
    @CurrentUser('author') author: Author,
  ): Promise<AuthorPost> {
    return this.postsService.revertToVersion(postId, version, author);
  }

  @Get(':id/post-versions')
  public async getPostVersions(
    @Param('id', ParseIntPipe) postId: number,
    @Query() query: QueryParamsDto,
  ): Promise<PaginatedResponse<PostVersion>> {
    return this.postsService.getPostVersions(postId, query);
  }

  @Delete(':id/post-versions/:version')
  public async deletePostVersion(
    @Param('id', ParseIntPipe) postId: number,
    @Param('version', ParseIntPipe) version: number,
  ): Promise<PostVersion> {
    return this.postsService.deletePostVersion(postId, version);
  }

  @Get(':id/post-version-diff')
  public async comparePostVersions(
    @Param('id', ParseIntPipe) postId: number,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<PostVersionDiff> {
    return this.postsService.comparePostVersions(postId, from, to);
  }

  @UseGuards(RoleGuard)
  @Roles(ROLES.MODERATOR)
  @Patch(':id/approve')
  public async approvePost(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('moderator') moderator: Moderator,
  ): Promise<AuthorPost> {
    return this.postsService.approvePost(postId, moderator);
  }

  @UseGuards(RoleGuard)
  @Roles(ROLES.MODERATOR)
  @Patch(':id/request-revision')
  public async requestRevision(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('moderator') moderator: Moderator,
    @Body() dto: { comment: string },
  ): Promise<AuthorPost> {
    return this.postsService.requestRevision(postId, dto.comment, moderator);
  }

  @UseGuards(RoleGuard)
  @Roles(ROLES.MODERATOR)
  @Patch(':id/reject')
  public async rejectPost(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('moderator') moderator: Moderator,
    @Body() dto: { comment: string; reasons: string[] },
  ): Promise<AuthorPost> {
    return this.postsService.rejectPost(postId, dto, moderator);
  }

  @Get(':id/history')
  public async getPostHistory(@Param('id', ParseIntPipe) postId: number): Promise<(ModerationHistory | PostHistory)[]> {
    return this.postsService.getPostHistory(postId);
  }

  @Post()
  public async create(
    @CurrentUser('author') author: Author | undefined,
    @Body() dto: CreatePostDto,
  ): Promise<AuthorPost> {
    return this.postsService.createOne(dto, author);
  }

  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('author') author: Author | undefined,
    @Body() dto: UpdatePostDto,
  ): Promise<AuthorPost> {
    return this.postsService.updateOne(id, dto, author);
  }

  @Delete(':id')
  public async deleteById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('author') author: Author | undefined,
  ): Promise<AuthorPost> {
    return this.postsService.deleteById(id, author);
  }
}

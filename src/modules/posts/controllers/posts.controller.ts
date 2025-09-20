import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Author, Post as PostModel } from '@/generated/prisma';
import { FullUser } from '@/modules/users/types/user.type';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAccessGuard } from '../../auth/guards/jwt-acess.guard';
import { POST_STATUS } from '../constants/post';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostQueryParamsDto } from '../dto/post-query-params.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostViewCurrentDayService } from '../services/post-view-current-day.service';
import { PostViewsService } from '../services/post-views.service';
import { PostsService } from '../services/posts.service';

@UseGuards(JwtAccessGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postViewsService: PostViewsService,
    private readonly postViewCurrentDayService: PostViewCurrentDayService,
  ) {}

  @Get()
  public async getAll(@Query() query: PostQueryParamsDto): Promise<PaginatedResponse<PostModel>> {
    return this.postsService.getAll(query);
  }

  @Get(':username/posts')
  public async getPostsByAuthor(
    @Query()
    query: PostQueryParamsDto,
    @Param('username') username: string,
    @CurrentUser('author') author: Author,
  ): Promise<PaginatedResponse<PostModel>> {
    return this.postsService.getPostsByAuthor(username, query, author.username);
  }

  @Get('id/:id')
  public async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: FullUser,
  ): Promise<PostModel | null> {
    const post = await this.postsService.getOne({ id });

    if (post && user) {
      await this.postViewsService.createOne(post.id, user.id);
    }

    return post;
  }

  @Get(':slug')
  public async getBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: FullUser,
  ): Promise<PostModel & { currentDayViewStats?: { uniqueViewsToday: number; totalViewsToday: number } | null }> {
    const post = await this.postsService.findPostWithAuthors({ slug });
    let currentStats = null;

    if (post && post.status === POST_STATUS.APPROVED && user) {
      await this.postViewsService.createOne(post.id, user.id);
      currentStats = await this.postViewCurrentDayService.getCurrentDayStats(post);
    }

    return { ...post, currentDayViewStats: currentStats };
  }

  @Post()
  public async createOne(
    @CurrentUser('author') author: Author | undefined,
    @Body() dto: CreatePostDto,
  ): Promise<PostModel> {
    return this.postsService.createOne(dto, author);
  }

  @Patch(':id')
  public async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('author') author: Author | undefined,
    @Body() dto: UpdatePostDto,
  ): Promise<PostModel> {
    return this.postsService.updateOne(id, dto, author);
  }

  @Delete(':id')
  public async deleteOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('author') author: Author | undefined,
  ): Promise<PostModel> {
    return this.postsService.deleteOne({ id }, author);
  }
}

import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Author, Post as PostModel } from '@/generated/prisma';
import { FullUser } from '@/modules/users/types/user.type';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAccessGuard } from '../../auth/guards/jwt-acess.guard';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostQueryParamsDto } from '../dto/post-query-params.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FullPostAnalytics } from '../interfaces/full-post-analytics';
import { PostAnalyticsService } from '../services/post-analytics.service';
import { PostsService } from '../services/posts.service';

@UseGuards(JwtAccessGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postAnalyticsService: PostAnalyticsService,
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
    @CurrentUser('author') author: Author | null,
  ): Promise<PaginatedResponse<PostModel>> {
    return this.postsService.getPostsByAuthor(username, query, author?.username);
  }

  @Get('id/:id')
  public async getById(@Param('id', ParseIntPipe) id: number): Promise<PostModel | null> {
    return this.postsService.getOne({ id });
  }

  @Get(':slug')
  public async getBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: FullUser | null,
  ): Promise<FullPostAnalytics | null> {
    const postWithAuthors = await this.postsService.findPostWithAuthors({ slug });
    return this.postAnalyticsService.getFullPostAnalytics(postWithAuthors, user);
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

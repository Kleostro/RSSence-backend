import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Post as ProfilePost } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@UseGuards(JwtAccessGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  public async getAll(@Query() query: QueryParamsDto): Promise<PaginatedResponse<ProfilePost>> {
    return this.postsService.getAll(query);
  }

  @Get(':id')
  public async getById(@Param('id', ParseIntPipe) postId: number): Promise<ProfilePost> {
    return this.postsService.getById(postId);
  }

  @Get('author/:authorId')
  public async getByAuthorId(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Query() query: QueryParamsDto,
  ): Promise<PaginatedResponse<ProfilePost>> {
    return this.postsService.getByAuthorId(authorId, query);
  }

  @Post()
  public async create(
    @CurrentUser('id', ParseIntPipe) userId: number,
    @Body() createPostDto: CreatePostDto,
  ): Promise<ProfilePost> {
    return this.postsService.createOne(createPostDto, userId);
  }

  // TBD: Add a guard to check if the user is the author of the post
  @Delete(':id')
  public async deleteById(@Param('id', ParseIntPipe) postId: number): Promise<ProfilePost> {
    return this.postsService.deleteById(postId);
  }
}

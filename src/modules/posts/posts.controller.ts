import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Post as AuthorPost } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { FullUserInfoType } from '../users/types/types';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@UseGuards(JwtAccessGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  public async getAll(@Query() query: QueryParamsDto): Promise<PaginatedResponse<AuthorPost>> {
    return this.postsService.getAll(query);
  }

  @Get(':id')
  public async getById(@Param('id', ParseIntPipe) postId: number): Promise<AuthorPost | null> {
    return this.postsService.getById(postId);
  }

  @Post()
  public async create(
    @CurrentUser() currentUser: FullUserInfoType,
    @Body() createPostDto: CreatePostDto,
  ): Promise<AuthorPost> {
    return this.postsService.createOne(createPostDto, currentUser);
  }

  @Patch(':postId')
  public async update(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() currentUser: FullUserInfoType,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<AuthorPost> {
    return this.postsService.updateOne(postId, updatePostDto, currentUser);
  }

  // TBD: Add a guard to check if the user is the author of the post
  @Delete(':id')
  public async deleteById(@Param('id', ParseIntPipe) postId: number): Promise<AuthorPost> {
    return this.postsService.deleteById(postId);
  }
}

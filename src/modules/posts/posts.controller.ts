import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Post as ProfilePost } from '@prisma/client';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@UseGuards(JwtAccessGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  public async getAll(): Promise<ProfilePost[]> {
    return this.postsService.getAll();
  }

  @Get(':id')
  public async getById(@Param('id', ParseIntPipe) postId: number): Promise<ProfilePost> {
    return this.postsService.getById(postId);
  }

  @Get('author/:authorId')
  public async getByAuthorId(@Param('authorId', ParseIntPipe) authorId: number): Promise<ProfilePost[]> {
    return this.postsService.getByAuthorId(authorId);
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

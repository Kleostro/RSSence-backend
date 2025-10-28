import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Comment, Profile, VoteType } from '@/generated/prisma';
import { JwtAccessGuard } from '@/modules/auth/guards/jwt-acess.guard';
import { PostDailyQueryDto } from '@/modules/posts/dto/post-daily-query.dto';
import { UserWithProfileAndAuthor } from '@/modules/users/types/user.type';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { CommentQueryDto } from '../dto/comment-query.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentDailyStatsService } from '../services/comment-daily-stats.service';
import { CommentsService } from '../services/comments.service';

@Controller('comments')
@UseGuards(JwtAccessGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentDailyStatsService: CommentDailyStatsService,
  ) {}

  @Post('post/:postId')
  public async createOne(
    @Body() dto: CreateCommentDto,
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('profile') profile: Profile,
  ): Promise<Comment | void> {
    return this.commentsService.createOne(postId, profile.id, dto);
  }

  @Get('post/:postId')
  public async getCommentsByPostId(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: CommentQueryDto,
  ): Promise<PaginatedResponse<Comment>> {
    return this.commentsService.getCommentsByPostId(postId, query);
  }

  @Get(':parentId/children-count')
  public async getCommentChildrenCount(@Param('parentId', ParseIntPipe) parentId: number): Promise<{ count: number }> {
    return this.commentsService.getCommentChildrenCount(parentId);
  }

  @Get(':parentId/children')
  public async getChildrenByParentId(@Param('parentId', ParseIntPipe) parentId: number): Promise<Comment[]> {
    const comments = await this.commentsService.getChildrenByParentId(parentId);

    return comments;
  }

  @Get(':commentId')
  public async getOne(@Param('commentId', ParseIntPipe) commentId: number): Promise<Comment> {
    return this.commentsService.getOne({ id: commentId });
  }

  @Patch(':commentId')
  public async updateOne(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('profile') profile: Profile,
  ): Promise<Comment> {
    return this.commentsService.updateOne(commentId, profile.id, dto);
  }

  @Delete(':commentId')
  public async deleteOne(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: (UserWithProfileAndAuthor & { roles: string[] }) | null,
  ): Promise<Comment> {
    return this.commentsService.deleteOne(commentId, user);
  }

  @Post(':commentId/vote')
  public async vote(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('type') type: VoteType,
    @CurrentUser() user: UserWithProfileAndAuthor & { roles: string[] },
  ): Promise<Comment | null> {
    return this.commentsService.vote(commentId, user.id, type);
  }

  @Get('post/:postId/trend')
  public async getPostCommentTrend(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PostDailyQueryDto,
  ): Promise<{ totalComments: number; activeComments: number; date: Date }[]> {
    return this.commentDailyStatsService.getCommentTrend(postId, query.start, query.end);
  }
}

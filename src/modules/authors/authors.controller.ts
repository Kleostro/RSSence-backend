import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { ValidateQueryParamsPipe } from '@/common/pipes/validate-query-params.pipe';
import { Author, Post as AuthorPost, Prisma } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { AVATAR_VALIDATION_PIPE } from '../profiles/constants/file-pipe-builders';
import { FullUserInfoType } from '../users/types/types';
import { AuthorsService } from './authors.service';
import { CheckUsernameDto } from './dto/check-username';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@UseGuards(JwtAccessGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  public async getAll(
    @Query(new ValidateQueryParamsPipe<QueryParamsDto>(Object.keys(Prisma.AuthorScalarFieldEnum)))
    query: QueryParamsDto,
  ): Promise<PaginatedResponse<Author>> {
    return this.authorsService.getAll(query);
  }

  @Get(':username')
  public async getOne(@Param('username') username: string): Promise<Author | null> {
    return this.authorsService.getOne(username);
  }

  // Move to analytics service
  @Get(':username/contribution-stats')
  public async getAuthorContributionStats(
    @Param('username') username: string,
  ): Promise<{ label: string; count: number; value: string }[]> {
    return this.authorsService.getAuthorContributionStats(username);
  }

  @Get(':username/posts')
  public async getAuthorPosts(
    @Query(new ValidateQueryParamsPipe<QueryParamsDto>(Object.keys(Prisma.PostScalarFieldEnum)))
    query: QueryParamsDto,
    @Param('username') username: string,
  ): Promise<PaginatedResponse<AuthorPost>> {
    return this.authorsService.getAuthorPosts(username, query);
  }

  @Get(':username/post-statuses')
  public async getAuthorPostStatuses(@Param('username') username: string): Promise<{ name: string; count: number }[]> {
    return this.authorsService.getAuthorPostStatuses(username);
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  public async createOne(
    @Body() dto: CreateAuthorDto,
    @CurrentUser() currentUser: FullUserInfoType,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.createOne(dto, currentUser, avatar);
  }

  @Patch(':username')
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateOne(
    @Body() updateAuthorDto: UpdateAuthorDto,
    @Param('username') username: string,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.updateOne(updateAuthorDto, username, avatar);
  }

  @Delete(':username')
  public async deleteOne(@Param('username') username: string): Promise<Author> {
    return this.authorsService.deleteOne(username);
  }

  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.authorsService.checkAvailableUsername(username);
  }
}

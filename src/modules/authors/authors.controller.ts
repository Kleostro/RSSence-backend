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
  ParseIntPipe,
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

  @Get(':authorId')
  public async getOne(@Param('authorId', ParseIntPipe) authorId: number): Promise<Author | null> {
    return this.authorsService.getOne(authorId);
  }

  @Get(':authorId/posts')
  public async getAuthorPosts(
    @Query(new ValidateQueryParamsPipe<QueryParamsDto>(Object.keys(Prisma.PostScalarFieldEnum)))
    query: QueryParamsDto,
    @Param('authorId', ParseIntPipe) authorId: number,
  ): Promise<PaginatedResponse<AuthorPost>> {
    return this.authorsService.getAuthorPosts(authorId, query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  public async createOne(
    @Body() dto: CreateAuthorDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.createOne(dto, userId, avatar);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateOne(
    @Body() updateAuthorDto: UpdateAuthorDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.updateOne(updateAuthorDto, userId, avatar);
  }

  @Delete()
  public async deleteOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Author> {
    return this.authorsService.deleteOne(userId);
  }

  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.authorsService.checkAvailableUsername(username);
  }
}

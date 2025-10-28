import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { Author } from '@/generated/prisma';
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
import { PostQueryParamsDto } from '../posts/dto/post-query-params.dto';
import { PostStatuses } from '../posts/interfaces/post-statuses';
import { AVATAR_VALIDATION_PIPE } from '../profiles/constants/file-pipe-builders';
import { UserWithProfileAndAuthor } from '../users/types/user.type';
import { AuthorsService } from './authors.service';
import { AuthorQueryParamsDto } from './dto/author-query-params.dto';
import { CheckUsernameDto } from './dto/check-username';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorContributions } from './interfaces/author-contributions';

@UseGuards(JwtAccessGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  public async getAll(
    @Query()
    query: AuthorQueryParamsDto,
  ): Promise<PaginatedResponse<Author>> {
    return this.authorsService.getAll(query);
  }

  @Get(':username')
  public async getOne(@Param('username') username: string): Promise<Author> {
    return this.authorsService.getOne({ username });
  }

  // Move to analytics service
  @Get(':username/contribution-stats')
  public async getAuthorContributionStats(
    @Param('username') username: string,
    @Query() params: PostQueryParamsDto,
    @CurrentUser('author') author: Author | null,
  ): Promise<AuthorContributions[]> {
    return this.authorsService.getAuthorContributionStats(username, params, author?.username);
  }

  @Get(':username/post-statuses')
  public async getAuthorPostStatuses(
    @Param('username') username: string,
    @Query() params: PostQueryParamsDto,
    @CurrentUser('author') author: Author,
  ): Promise<PostStatuses[]> {
    return this.authorsService.getAuthorPostStatuses(username, params, author.username);
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  public async createOne(
    @Body() dto: CreateAuthorDto,
    @CurrentUser() currentUser: UserWithProfileAndAuthor | null,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.createOne(dto, currentUser, avatar);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateOne(
    @Body() dto: UpdateAuthorDto,
    @CurrentUser('author') author: Author | null,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.updateOne(dto, { id: author?.id }, avatar);
  }

  @Delete(':username')
  public async deleteOne(@Param('username') username: string): Promise<Author> {
    return this.authorsService.deleteOne({ username });
  }

  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.authorsService.checkAvailableUsername(username);
  }
}

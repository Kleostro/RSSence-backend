import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Author } from '@prisma/client';

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

  @Get('me')
  public async getMe(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Author | null> {
    return this.authorsService.getOne(userId);
  }

  @Post('me')
  @UseInterceptors(FileInterceptor('avatar'))
  public async createMe(
    @Body() dto: CreateAuthorDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.createOne(dto, userId, avatar);
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateMe(
    @Body() updateAuthorDto: UpdateAuthorDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Author> {
    return this.authorsService.updateOne(updateAuthorDto, userId, avatar);
  }

  @Delete('me')
  public async deleteMe(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Author> {
    return this.authorsService.deleteOne(userId);
  }

  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.authorsService.checkAvailableUsername(username);
  }
}

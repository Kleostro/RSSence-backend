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
import { ApiTags } from '@nestjs/swagger';
import { Profile } from '@prisma/client';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { AVATAR_VALIDATION_PIPE } from './constants/file-pipe-builders';
import { CheckUsernameDto } from './dto/check-username';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as profilesSwagger from './profiles-controller-swagger.decorators';
import { ProfilesService } from './profiles.service';

@ApiTags('Profile')
@UseGuards(JwtAccessGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @profilesSwagger.ApiGetMeProfile()
  @Get('me')
  public async getMe(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile | null> {
    return this.profilesService.getOne(userId);
  }

  @profilesSwagger.ApiCreateMeProfile()
  @Post('me')
  @UseInterceptors(FileInterceptor('avatar'))
  public async createMe(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Profile> {
    return this.profilesService.createOne(createProfileDto, userId, avatar);
  }

  @profilesSwagger.ApiUpdateMeProfile()
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateMe(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Profile> {
    return this.profilesService.updateOne(updateProfileDto, userId, avatar);
  }

  @profilesSwagger.ApiDeleteMeProfile()
  @Delete('me')
  public async deleteMe(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile> {
    return this.profilesService.deleteOne(userId);
  }

  @profilesSwagger.ApiCheckAvailableUsername()
  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.profilesService.checkAvailableUsername(username);
  }
}

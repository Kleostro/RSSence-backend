import { Profile } from '@/generated/prisma';
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

  @Get()
  public async getAll(): Promise<Profile[]> {
    return this.profilesService.getAll();
  }

  @profilesSwagger.ApiCreateMeProfile()
  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  public async createOne(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Profile> {
    return this.profilesService.createOne(createProfileDto, userId, avatar);
  }

  @profilesSwagger.ApiUpdateMeProfile()
  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateOne(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Profile> {
    return this.profilesService.updateOne(updateProfileDto, userId, avatar);
  }

  @profilesSwagger.ApiDeleteMeProfile()
  @Delete()
  public async deleteOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile> {
    return this.profilesService.deleteOne(userId);
  }

  @profilesSwagger.ApiCheckAvailableUsername()
  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.profilesService.checkAvailableUsername(username);
  }
}

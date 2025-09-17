import { Profile } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { UpdateAuthorDto } from '../authors/dto/update-author.dto';
import { UserWithProfileAndAuthor } from '../users/types/user.type';
import { AVATAR_VALIDATION_PIPE } from './constants/file-pipe-builders';
import { CheckUsernameDto } from './dto/check-username';
import { CreateProfileDto } from './dto/create-profile.dto';
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

  @Get(':username')
  public async getOne(@Param('username') username: string): Promise<Profile> {
    return this.profilesService.getOne({ username });
  }

  @profilesSwagger.ApiCreateMeProfile()
  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  public async createOne(
    @Body() dto: CreateProfileDto,
    @CurrentUser() currentUser: UserWithProfileAndAuthor | null,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar: Express.Multer.File,
  ): Promise<Profile> {
    return this.profilesService.createOne(dto, currentUser, avatar);
  }

  @profilesSwagger.ApiUpdateMeProfile()
  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateOne(
    @Body() dto: UpdateAuthorDto,
    @CurrentUser('profile') profile: Profile | null,
    @UploadedFile(AVATAR_VALIDATION_PIPE) avatar?: Express.Multer.File,
  ): Promise<Profile> {
    return this.profilesService.updateOne(dto, { id: profile?.id }, avatar);
  }

  @Delete(':username')
  public async deleteOne(@Param('username') username: string): Promise<Profile> {
    return this.profilesService.deleteOne({ username });
  }

  @profilesSwagger.ApiCheckAvailableUsername()
  @Post('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.profilesService.checkAvailableUsername(username);
  }
}

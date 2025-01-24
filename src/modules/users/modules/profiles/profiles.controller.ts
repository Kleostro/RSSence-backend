import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { CheckUsernameDto } from './dto/check-username';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@UseGuards(JwtAccessGuard)
@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  public async getOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile | null> {
    return this.profilesService.getOne(userId);
  }

  @Post('me')
  public async createOne(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<Profile> {
    return this.profilesService.createOne(createProfileDto, userId);
  }

  @Patch('me')
  public async updateOne(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<Profile | null> {
    return this.profilesService.updateOne(updateProfileDto, userId);
  }

  @Delete('me')
  public async deleteOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile> {
    return this.profilesService.deleteOne(userId);
  }

  @Get('username-check')
  public async checkAvailableUsername(@Body() { username }: CheckUsernameDto): Promise<boolean> {
    return this.profilesService.checkAvailableUsername(username);
  }
}

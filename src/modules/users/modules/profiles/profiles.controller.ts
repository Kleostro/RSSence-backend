import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@UseGuards(JwtAccessGuard)
@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  public async createOne(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<Profile> {
    return this.profilesService.createOne(createProfileDto, userId);
  }

  @Get()
  public async getMe(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile | null> {
    return this.profilesService.getMe(userId);
  }

  @Patch()
  public async updateOne(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<Profile | null> {
    return this.profilesService.updateOne(updateProfileDto, userId);
  }

  @Delete()
  public async removeOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<Profile> {
    return this.profilesService.removeOne(userId);
  }
}

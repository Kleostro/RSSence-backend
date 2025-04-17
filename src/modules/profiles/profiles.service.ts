import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { AVATAR_OPTIONS } from './constants/images-options';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesUtilService } from './services/profiles-util.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly profilesUtilService: ProfilesUtilService,
  ) {}

  public async createOne(dto: CreateProfileDto, userId: number, avatar?: Express.Multer.File): Promise<Profile> {
    await this.profilesUtilService.ensureProfileDoesNotExist(userId);

    if (!dto.username) {
      await this.profilesUtilService.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    return this.prisma.profile.create({ data: { ...dto, userId, avatarUrl } });
  }

  public async getOne(userId: number): Promise<Profile | null> {
    return this.prisma.profile.findFirst({ where: { userId } }) ?? null;
  }

  public async updateOne(dto: UpdateProfileDto, userId: number, avatar?: Express.Multer.File): Promise<Profile> {
    await this.profilesUtilService.ensureProfileExists(userId);

    if (dto.username) {
      await this.profilesUtilService.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    if (!avatarUrl) {
      return this.prisma.profile.update({ where: { userId }, data: { ...dto } });
    }

    return this.prisma.profile.update({ where: { userId }, data: { ...dto, avatarUrl } });
  }

  public async deleteOne(userId: number): Promise<Profile> {
    await this.profilesUtilService.ensureProfileExists(userId);

    const hasAuthor = await this.prisma.author.findFirst({ where: { userId } });

    if (hasAuthor) {
      await this.prisma.author.delete({ where: { userId } });
    }
    return this.prisma.profile.delete({ where: { userId } });
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    return this.profilesUtilService.checkAvailableUsername(username);
  }
}

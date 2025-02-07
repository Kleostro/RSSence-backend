import { PrismaService } from '@/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { FileService } from '@/shared/services/file/file.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { AVATAR_OPTIONS } from './constants/images-options';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  public async createOne(dto: CreateProfileDto, userId: number, avatar?: Express.Multer.File): Promise<Profile> {
    await this.ensureProfileDoesNotExist(userId);

    if (!dto.username) {
      await this.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    return this.prisma.profile.create({ data: { ...dto, userId, avatarUrl } });
  }

  public async getOne(userId: number): Promise<Profile | null> {
    await this.ensureProfileExists(userId);
    return this.prisma.profile.findFirst({ where: { userId } });
  }

  public async updateOne(dto: UpdateProfileDto, userId: number, avatar?: Express.Multer.File): Promise<Profile> {
    await this.ensureProfileExists(userId);

    if (dto.username) {
      await this.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    if (!avatarUrl) {
      return this.prisma.profile.update({ where: { userId }, data: { ...dto } });
    }

    return this.prisma.profile.update({ where: { userId }, data: { ...dto, avatarUrl } });
  }

  public async deleteOne(userId: number): Promise<Profile> {
    await this.ensureProfileExists(userId);
    return this.prisma.profile.delete({ where: { userId } });
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    const result = await this.prisma.profile.findFirst({ where: { username } });
    return !result;
  }

  private async ensureUsernameAvailable(username?: string): Promise<void> {
    const result = await this.checkAvailableUsername(username);
    if (!result) {
      throw new ConflictException(ERROR_MESSAGES.USERNAME_EXISTS);
    }
  }

  private async hasProfile(userId: number): Promise<Profile | null> {
    const result = await this.prisma.profile.findFirst({ where: { userId } });
    return result;
  }

  private async ensureProfileExists(userId: number): Promise<void> {
    const hasProfile = await this.hasProfile(userId);
    if (!hasProfile) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }
  }

  private async ensureProfileDoesNotExist(userId: number): Promise<void> {
    const hasProfile = await this.hasProfile(userId);
    if (hasProfile) {
      throw new ConflictException(ERROR_MESSAGES.PROFILE_EXISTS);
    }
  }
}

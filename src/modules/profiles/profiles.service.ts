import { Prisma, Profile } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { FileService } from '@/shared/services/file/file.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UserWithProfileAndAuthor } from '../users/types/user.type';
import { AVATAR_OPTIONS } from './constants/images-options';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  public async getAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany();
  }

  public async getOne(where: Prisma.ProfileWhereUniqueInput): Promise<Profile> {
    return this.findProfile({ where });
  }

  private async findProfile(options: Prisma.ProfileFindUniqueArgs): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique(options);

    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    return profile;
  }

  public async createOne(
    data: Prisma.ProfileCreateManyInput,
    currentUser: UserWithProfileAndAuthor | null,
    avatar?: Express.Multer.File,
  ): Promise<Profile> {
    if (currentUser?.profile) {
      throw new ConflictException(ERROR_MESSAGES.PROFILE_EXISTS);
    }

    if (data.username) {
      await this.ensureUsernameAvailable(data.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    const newProfile = await this.prisma.profile.create({ data: { ...data, avatarUrl, userId: currentUser?.id } });
    return newProfile;
  }

  public async updateOne(
    data: Prisma.ProfileUpdateManyMutationInput,
    where: Prisma.ProfileWhereUniqueInput,
    avatar?: Express.Multer.File,
  ): Promise<Profile> {
    await this.findProfile({ where });

    if (data.username) {
      await this.ensureUsernameAvailable(String(data.username));
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    return this.prisma.profile.update({
      where,
      data: !avatarUrl ? { ...data } : { ...data, avatarUrl },
    });
  }

  public async deleteOne(where: Prisma.ProfileWhereUniqueInput): Promise<Profile> {
    await this.findProfile({ where });
    return this.prisma.profile.delete({ where });
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
}

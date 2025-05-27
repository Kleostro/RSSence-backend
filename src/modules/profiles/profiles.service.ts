import { Profile } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { FileService } from '@/shared/services/file/file.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { FullUserInfoType } from '../users/types/types';
import { AVATAR_OPTIONS } from './constants/images-options';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  public async getAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany();
  }

  public async getOne(where: { id?: number; username?: string }): Promise<Profile | null> {
    return this.prisma.profile.findFirst({ where });
  }

  public async createOne(
    dto: CreateProfileDto,
    currentUser: FullUserInfoType,
    avatar?: Express.Multer.File,
  ): Promise<Profile> {
    if (currentUser.profile) {
      throw new ConflictException(ERROR_MESSAGES.PROFILE_EXISTS);
    }

    if (dto.username) {
      await this.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          ...dto,
          avatarUrl,
        },
      });

      await tx.user.update({
        where: { id: currentUser.id },
        data: { profileUsername: profile.username },
      });

      return profile;
    });
  }

  public async updateOne(
    dto: UpdateProfileDto,
    currentUser: FullUserInfoType,
    avatar?: Express.Multer.File,
  ): Promise<Profile> {
    if (!currentUser.profile) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    if (dto.username) {
      await this.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    if (!avatarUrl) {
      return this.prisma.profile.update({ where: { id: currentUser.profile.id }, data: { ...dto } });
    }
    return this.prisma.profile.update({ where: { id: currentUser.profile.id }, data: { ...dto, avatarUrl } });
  }

  public async deleteOne(currentUser: FullUserInfoType): Promise<Profile> {
    const { profile } = currentUser;
    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    return this.prisma.$transaction(async (tx) => {
      if (profile.authorUsername) {
        const mainPosts = await tx.postAuthor.findMany({
          where: {
            authorUsername: profile.authorUsername,
            isMainAuthor: true,
          },
          select: { postId: true },
        });

        const postIds = mainPosts.map((p) => p.postId);
        if (postIds.length > 0) {
          await tx.post.deleteMany({ where: { id: { in: postIds } } });
        }

        await tx.author.delete({ where: { username: profile.authorUsername } });
      }
      await tx.user.update({
        where: { id: currentUser.id },
        data: { profileUsername: null },
      });

      return tx.profile.delete({ where: { id: profile.id } });
    });
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

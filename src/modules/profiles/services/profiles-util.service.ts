import { PrismaService } from '@/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfilesUtilService {
  constructor(private readonly prisma: PrismaService) {}

  public async ensureProfileExists(userId: number): Promise<void> {
    const hasProfile = await this.hasProfile(userId);
    if (!hasProfile) {
      throw new NotFoundException(`Profile for userId ${userId} does not exist.`);
    }
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    const result = await this.prisma.profile.findFirst({ where: { username } });
    return !result;
  }

  public async ensureUsernameAvailable(username?: string): Promise<void> {
    const result = await this.checkAvailableUsername(username);
    if (!result) {
      throw new ConflictException(ERROR_MESSAGES.USERNAME_EXISTS);
    }
  }

  public async ensureProfileDoesNotExist(userId: number): Promise<void> {
    const hasProfile = await this.hasProfile(userId);
    if (hasProfile) {
      throw new ConflictException(ERROR_MESSAGES.PROFILE_EXISTS);
    }
  }

  private async hasProfile(userId: number): Promise<Profile | null> {
    const result = await this.prisma.profile.findFirst({ where: { userId } });
    return result;
  }
}

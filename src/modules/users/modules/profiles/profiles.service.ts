import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  public async createOne(dto: CreateProfileDto, userId: number): Promise<Profile> {
    await this.ensureProfileDoesNotExist(userId);
    return this.prisma.profile.create({ data: { ...dto, userId } });
  }

  public async getMe(userId: number): Promise<Profile | null> {
    await this.ensureProfileExists(userId);
    return this.prisma.profile.findFirst({ where: { userId } });
  }

  public async updateOne(dto: UpdateProfileDto, userId: number): Promise<Profile | null> {
    await this.ensureProfileExists(userId);
    return this.prisma.profile.update({ where: { userId }, data: dto });
  }

  public async removeOne(userId: number): Promise<Profile> {
    await this.ensureProfileExists(userId);
    return this.prisma.profile.delete({ where: { userId } });
  }

  private async hasProfile(userId: number): Promise<Profile | null> {
    const result = await this.prisma.profile.findFirst({ where: { userId } });
    return result;
  }

  private async ensureProfileExists(userId: number): Promise<void> {
    const hasProfile = await this.hasProfile(userId);
    if (!hasProfile) {
      throw new NotFoundException();
    }
  }

  private async ensureProfileDoesNotExist(userId: number): Promise<void> {
    const hasProfile = await this.hasProfile(userId);
    if (hasProfile) {
      throw new ConflictException('Profile already exist!');
    }
  }
}

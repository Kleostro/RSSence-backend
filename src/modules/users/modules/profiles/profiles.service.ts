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
    await this.ensureUsernameAvailable(dto.username);
    return this.prisma.profile.create({ data: { ...dto, userId } });
  }

  public async getOne(userId: number): Promise<Profile | null> {
    await this.ensureProfileExists(userId);
    return this.prisma.profile.findFirst({ where: { userId } });
  }

  public async updateOne(dto: UpdateProfileDto, userId: number): Promise<Profile | null> {
    await this.ensureProfileExists(userId);
    await this.ensureUsernameAvailable(dto.username);
    return this.prisma.profile.update({ where: { userId }, data: dto });
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
      throw new ConflictException('Username already exist!');
    }
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

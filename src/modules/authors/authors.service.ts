import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Injectable } from '@nestjs/common';
import { Author } from '@prisma/client';

import { AVATAR_OPTIONS } from '../profiles/constants/images-options';
import { ProfilesUtilService } from '../profiles/services/profiles-util.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsUtilService } from './services/authors-util.service';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly authorsUtilService: AuthorsUtilService,
    private readonly profilesUtilService: ProfilesUtilService,
  ) {}

  public async getOne(userId: number): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { userId } });
  }

  public async createOne(dto: CreateAuthorDto, userId: number, avatar?: Express.Multer.File): Promise<Author> {
    await this.profilesUtilService.ensureProfileExists(userId);

    if (!dto.username) {
      await this.profilesUtilService.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;
    return this.prisma.author.create({ data: { ...dto, userId, avatarUrl } });
  }

  public async updateOne(dto: UpdateAuthorDto, userId: number, avatar?: Express.Multer.File): Promise<Author> {
    await this.profilesUtilService.ensureProfileExists(userId);
    await this.authorsUtilService.ensureAuthorExists(userId);

    if (dto.username) {
      await this.profilesUtilService.ensureUsernameAvailable(dto.username);
    }

    const avatarUrl = avatar ? await this.fileService.processImage(avatar, AVATAR_OPTIONS) : null;

    if (!avatarUrl) {
      return this.prisma.author.update({ where: { userId }, data: { ...dto } });
    }

    return this.prisma.author.update({ where: { userId }, data: { ...dto, avatarUrl } });
  }

  public async deleteOne(userId: number): Promise<Author> {
    await this.profilesUtilService.ensureProfileExists(userId);
    await this.authorsUtilService.ensureAuthorExists(userId);
    return this.prisma.author.delete({ where: { userId } });
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    return this.authorsUtilService.checkAvailableUsername(username);
  }
}

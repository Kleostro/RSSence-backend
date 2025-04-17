import { PrismaService } from '@/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Author } from '@prisma/client';

@Injectable()
export class AuthorsUtilService {
  constructor(private readonly prisma: PrismaService) {}

  public async ensureAuthorExists(userId: number): Promise<void> {
    const hasAuthor = await this.hasAuthor(userId);
    if (!hasAuthor) {
      throw new NotFoundException(`Author for userId ${userId} does not exist.`);
    }
  }

  public async hasAuthor(userId: number): Promise<Author | null> {
    const result = await this.prisma.author.findFirst({ where: { userId } });
    return result;
  }

  public async checkAvailableUsername(username?: string): Promise<boolean> {
    const result = await this.prisma.author.findFirst({ where: { username } });
    return !result;
  }

  public async ensureUsernameAvailable(username?: string): Promise<void> {
    const result = await this.checkAvailableUsername(username);
    if (!result) {
      throw new ConflictException(ERROR_MESSAGES.USERNAME_EXISTS);
    }
  }
}

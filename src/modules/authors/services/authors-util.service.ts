import { Author } from '@/generated/prisma';
import { PrismaService } from '@/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthorsUtilService {
  constructor(private readonly prisma: PrismaService) {}

  public async ensureAuthorExists({ id, userId }: { id?: number; userId?: number }): Promise<Author> {
    const hasAuthor = await this.hasAuthor({ id, userId });
    if (!hasAuthor) {
      throw new NotFoundException(`Author does not exist.`);
    }

    return hasAuthor;
  }

  public async hasAuthor({ id, userId }: { id?: number; userId?: number }): Promise<Author | null> {
    const result = await this.prisma.author.findFirst({ where: { id, userId } });
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

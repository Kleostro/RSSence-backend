import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const result = Boolean(await this.prisma.user.findUnique({ where: { email } }));

    if (result) {
      throw new ConflictException('Email already exist!');
    }

    return false;
  }
}

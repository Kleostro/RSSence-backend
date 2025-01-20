import { PrismaService } from '@/prisma.service';
import { normalizeEmail } from '@/shared/utils/normalizeEmail';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async createOne({ email, hashedPassword }: CreateUserDto): Promise<User> {
    if (hashedPassword) {
      await this.isEmailExist(email);
    }

    const user = await this.prisma.user.create({ data: { email, hashedPassword } });
    return user;
  }

  public async getOne({ id, email }: GetUserDto): Promise<User | null> {
    if (!id && !email) {
      throw new BadRequestException();
    }

    const user = await this.prisma.user.findFirst({ where: { id, email } });

    return user;
  }

  private async isEmailExist(email: string): Promise<boolean> {
    const result = Boolean(await this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } }));

    if (result) {
      throw new ConflictException('Email already exist!');
    }

    return false;
  }
}

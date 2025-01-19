import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  public async createOne(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({ data: dto });
    return user;
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Could not find any user!');
    }

    return user;
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const result = Boolean(await this.prisma.user.findUnique({ where: { email } }));

    if (result) {
      throw new ConflictException('Email already exist!');
    }

    return false;
  }
}

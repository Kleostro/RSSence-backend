import { PrismaService } from '@/prisma.service';
import { normalizeEmail } from '@/shared/utils/normalizeEmail';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async getOne({ id, email }: GetUserDto): Promise<User | null> {
    if (!id && !email) {
      throw new BadRequestException();
    }

    const user = await this.prisma.user.findFirst({ where: { id, email } });

    return user;
  }

  public async createOne({ email, hashedPassword }: CreateUserDto): Promise<User> {
    if (hashedPassword) {
      await this.isEmailExist(email);
    }

    const user = await this.prisma.user.create({ data: { email, hashedPassword } });
    return user;
  }

  public async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  public async updateOne(dto: UpdateUserDto, userId: number): Promise<User | null> {
    await this.ensureUserExists(userId);
    await this.isEmailExist(dto.email);

    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  public async deleteAll(): Promise<unknown> {
    return this.prisma.user.deleteMany();
  }

  public async deleteOne(userId: number): Promise<User> {
    await this.ensureUserExists(userId);
    return this.prisma.user.delete({ where: { id: userId } });
  }

  public async checkAvailableEmail(email: string): Promise<boolean> {
    const result = await this.prisma.user.findFirst({ where: { email: normalizeEmail(email) } });
    return !result;
  }

  public async isEmailExist(email = ''): Promise<boolean> {
    const result = Boolean(await this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } }));

    if (result) {
      throw new ConflictException('Email already exist!');
    }

    return false;
  }

  private async hasUser(id: number): Promise<User | null> {
    const result = await this.prisma.user.findFirst({ where: { id } });
    return result;
  }

  private async ensureUserExists(userId: number): Promise<void> {
    const hasUser = await this.hasUser(userId);
    if (!hasUser) {
      throw new NotFoundException();
    }
  }
}

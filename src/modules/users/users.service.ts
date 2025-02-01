import { PrismaService } from '@/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';

import { RolesService } from '../roles/roles.service';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  public async getOne({ id, email }: GetUserDto): Promise<User & { roles: string[] }> {
    if (!id && !email) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const user = await this.prisma.user.findFirst({
      where: { id, email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      ...user,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
  }

  public async createOne({ email, hashedPassword }: { email: string; hashedPassword: string }): Promise<User> {
    await this.isEmailExist(email);

    const user = await this.prisma.user.create({ data: { email, hashedPassword } });
    return user;
  }

  public async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({ include: { roles: { include: { role: true } } } });

    return users.map((user) => ({
      ...user,
      roles: user.roles.map((userRole) => userRole.role.name),
    }));
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
    const result = await this.prisma.user.findFirst({ where: { email } });
    return !result;
  }

  public async isEmailExist(email = ''): Promise<boolean> {
    const result = Boolean(await this.prisma.user.findUnique({ where: { email } }));

    if (result) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_EXISTS);
    }

    return false;
  }

  public async addRoleToUser(userId: number, roleName: string): Promise<UserRole> {
    await this.ensureUserExists(userId);
    return this.rolesService.addRoleToUser(userId, roleName);
  }

  public async removeRoleFromUser(userId: number, roleName: string): Promise<UserRole> {
    await this.ensureUserExists(userId);
    const role = await this.rolesService.getOne({ name: roleName });
    return this.rolesService.removeRoleFromUser(userId, role.id);
  }

  private async hasUser(id: number): Promise<User | null> {
    const result = await this.prisma.user.findFirst({ where: { id } });
    return result;
  }

  private async ensureUserExists(userId: number): Promise<void> {
    const hasUser = await this.hasUser(userId);
    if (!hasUser) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  }
}

import { Role, UserRole } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { GetRoleDto } from './dto/get-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  public async getAll(): Promise<Role[]> {
    return this.prisma.role.findMany({ include: { users: true } });
  }

  public async getOne({ id, name }: GetRoleDto): Promise<Role> {
    if (!id && !name) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_ROLE);
    }

    const role = await this.prisma.role.findUnique({ where: { id, name } });

    if (!role) {
      throw new NotFoundException(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    return role;
  }

  public async createOne(dto: CreateRoleDto): Promise<Role> {
    await this.isRoleExists(dto.name);
    return this.prisma.role.create({ data: dto });
  }

  private async hasRole(name: string): Promise<Role | null> {
    const result = await this.prisma.role.findFirst({ where: { name } });
    return result;
  }

  public async addRoleToUser(userId: number, name: string): Promise<UserRole> {
    const role = await this.getOne({ name });
    await this.userHasRole(userId, role.id);
    return this.prisma.userRole.create({ data: { userId, roleId: role.id } });
  }

  public async removeRoleFromUser(userId: number, roleId: number): Promise<UserRole> {
    await this.hasUserRole(userId, roleId);
    return this.prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
  }

  public async isRoleExists(name: string): Promise<null> {
    const role = await this.hasRole(name);

    if (role) {
      throw new ConflictException(ERROR_MESSAGES.ROLE_EXISTS);
    }

    return null;
  }

  public async hasUserRole(userId: number, roleId: number): Promise<UserRole | null> {
    const result = await this.prisma.userRole.findFirst({ where: { userId, roleId } });
    return result;
  }

  public async deleteAll(): Promise<unknown> {
    return this.prisma.role.deleteMany();
  }

  public async deleteOne(name: string): Promise<Role> {
    const role = await this.getOne({ name });
    await this.prisma.userRole.deleteMany({ where: { roleId: role.id } });
    return this.prisma.role.delete({ where: { name } });
  }

  private async userHasRole(userId: number, roleId: number): Promise<null> {
    const userRole = await this.hasUserRole(userId, roleId);

    if (userRole) {
      throw new ConflictException(ERROR_MESSAGES.USER_HAS_ROLE);
    }

    return null;
  }
}

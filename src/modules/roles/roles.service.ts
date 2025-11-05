import { Prisma, Role, UserRole } from '@/generated/prisma';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ROLES } from '@/shared/constants/roles';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { FullUserRole } from '../users/types/user.type';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  public async getAll(): Promise<Role[]> {
    return this.prisma.role.findMany({ include: { users: true } });
  }

  public async getHierarchy(): Promise<{ name: string; priority: number }[]> {
    return this.prisma.role.findMany({ orderBy: { priority: 'asc' }, select: { name: true, priority: true } });
  }

  public async hasPriorityAtLeast(userRoles: FullUserRole[], minRoleName: string): Promise<boolean> {
    const minRole = await this.getOne({ name: minRoleName });

    if (!minRole) {
      return false;
    }

    return userRoles.some((ur) => ur.role.priority >= minRole.priority);
  }

  public async getOne(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
    return this.findRole({ where });
  }

  private async findRole(options: Prisma.RoleFindUniqueArgs): Promise<Role> {
    const role = await this.prisma.role.findUnique(options);

    if (!role) {
      throw new NotFoundException(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    return role;
  }

  public async createOne(data: Prisma.RoleCreateInput): Promise<Role> {
    await this.isRoleExists(data.name);
    return this.prisma.role.create({ data });
  }

  private async hasRole(where: Prisma.RoleWhereUniqueInput): Promise<Role | null> {
    const result = await this.prisma.role.findFirst({ where });
    return result;
  }

  public async addRoleToUser(userId: number, name: string): Promise<UserRole> {
    const role = await this.getOne({ name });
    await this.userHasRole(userId, role.id);

    if (name === ROLES.MODERATOR) {
      await this.prisma.moderator.upsert({
        where: { userId },
        update: {},
        create: { user: { connect: { id: userId } } },
      });
    }

    return this.prisma.userRole.create({ data: { userId, roleId: role.id } });
  }

  public async removeRoleFromUser(userId: number, roleId: number): Promise<UserRole> {
    const hasUserRole = await this.hasUserRole(userId, roleId);

    if (!hasUserRole) {
      throw new NotFoundException(ERROR_MESSAGES.USER_ROLE_NOT_FOUND);
    }

    return this.prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
  }

  public async isRoleExists(name: string): Promise<null> {
    const role = await this.hasRole({ name });

    if (role) {
      throw new ConflictException(ERROR_MESSAGES.ROLE_EXISTS);
    }

    return null;
  }

  public async hasUserRole(userId: number, roleId: number): Promise<UserRole | null> {
    const result = await this.prisma.userRole.findFirst({ where: { userId, roleId } });
    return result;
  }

  public async deleteAll(): Promise<BatchPayload> {
    return this.prisma.role.deleteMany();
  }

  public async deleteOne(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
    await this.findRole({ where });
    return this.prisma.role.delete({ where });
  }

  private async userHasRole(userId: number, roleId: number): Promise<null> {
    const userRole = await this.hasUserRole(userId, roleId);

    if (userRole) {
      throw new ConflictException(ERROR_MESSAGES.USER_HAS_ROLE);
    }

    return null;
  }
}

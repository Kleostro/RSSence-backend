import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Prisma, User, UserRole } from '@/generated/prisma';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ROLES } from '@/shared/constants/roles';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { RolesService } from '../roles/roles.service';
import { FullUser, UserWithProfileAndAuthor } from './types/user.type';

@Injectable()
export class UsersService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {
    super(prisma);
  }

  public async getOne(where: Prisma.UserWhereUniqueInput): Promise<UserWithProfileAndAuthor & { roles: string[] }> {
    const user = await this.prisma.user.findUnique({
      where,
      include: { roles: { include: { role: true } }, profile: true, author: true, moderator: true },
      omit: { hashedPassword: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      ...user,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
  }

  public async createOne(data: Prisma.UserCreateInput): Promise<User> {
    await this.isEmailExist(data.email);
    const user = await this.prisma.user.create({
      data: { ...data, roles: { create: { role: { connect: { name: ROLES.USER } } } } },
    });
    return user;
  }

  public async getAll(
    params: QueryParamsDto,
  ): Promise<PaginatedResponse<Omit<User, 'hashedPassword'> & { roles: string[] }>> {
    const where: Prisma.UserWhereInput = params.search
      ? { [params.searchField || 'email']: { contains: params.search, mode: 'insensitive' } }
      : {};

    const include: Prisma.UserInclude = { roles: { include: { role: true } }, profile: true, author: true };
    const orderBy: Prisma.UserOrderByWithRelationInput = { [params.sortBy || 'id']: params.sortOrder || 'asc' };
    const omit: Prisma.UserOmit = { hashedPassword: true };
    const args: Prisma.UserFindManyArgs = { where, include, orderBy, omit };

    const result = await this.getPaginatedResult<FullUser, Prisma.UserFindManyArgs>({
      model: this.prisma.user,
      args,
      page: params.page,
      limit: params.limit,
    });

    return {
      ...result,
      items: result.items.map((user) => ({
        ...user,
        roles: user.roles.sort((a, b) => a.role.priority - b.role.priority).map((userRole) => userRole.role.name),
      })),
    };
  }

  public async updateOne(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    await this.findUser({ where });

    if (data.email) {
      await this.isEmailExist(String(data.email));
    }

    return this.prisma.user.update({ where, data });
  }

  public async deleteAll(): Promise<BatchPayload> {
    return this.prisma.user.deleteMany();
  }

  public async deleteOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    await this.findUser({ where });
    return this.prisma.user.delete({ where });
  }

  public async checkAvailableEmail(email: string): Promise<boolean> {
    const result = await this.prisma.user.findFirst({ where: { email } });
    return !result;
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const result = Boolean(await this.prisma.user.findUnique({ where: { email } }));

    if (result) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_EXISTS);
    }

    return false;
  }

  public async addRoleToUser(where: Prisma.UserWhereUniqueInput, roleName: string): Promise<UserRole> {
    const user = await this.findUser({ where });
    return this.rolesService.addRoleToUser(user.id, roleName);
  }

  public async removeRoleFromUser(where: Prisma.UserWhereUniqueInput, roleName: string): Promise<UserRole> {
    const user = await this.findUser({ where });
    const role = await this.rolesService.getOne({ name: roleName });
    return this.rolesService.removeRoleFromUser(user.id, role.id);
  }

  private async findUser(options: Prisma.UserFindUniqueArgs): Promise<User> {
    const user = await this.prisma.user.findUnique(options);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}

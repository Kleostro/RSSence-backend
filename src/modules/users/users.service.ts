import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { User, UserRole } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { ROLES } from '@/shared/constants/roles';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { RolesService } from '../roles/roles.service';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FullUserInfoType, UserWithRelationsWithoutPassword, UserWithRoles } from './types/types';

@Injectable()
export class UsersService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {
    super(prisma, 'id', 'email');
  }

  public async getOne({ id, email }: GetUserDto): Promise<FullUserInfoType> {
    if (!id && !email) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const user = await this.prisma.user.findFirst({
      where: { id, email },
      include: { roles: { include: { role: true } } },
      omit: { hashedPassword: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    let profile = null;

    if (user.profileUsername) {
      profile = await this.prisma.profile.findFirst({ where: { username: user.profileUsername } });
    }

    let author = null;

    if (profile && profile.authorUsername) {
      author = await this.prisma.author.findFirst({ where: { username: profile.authorUsername } });
    }

    let moderator = null;

    if (user.moderatorId) {
      moderator = await this.prisma.moderator.findFirst({ where: { id: user.moderatorId } });
    }

    return {
      ...user,
      roles: user.roles.map((userRole) => userRole.role.name),
      profile,
      moderator,
      author,
    };
  }

  public async createOne({ email, hashedPassword }: { email: string; hashedPassword: string }): Promise<User> {
    await this.isEmailExist(email);

    const user = await this.prisma.user.create({ data: { email, hashedPassword } });
    await this.addRoleToUser(user.id, ROLES.USER);
    return user;
  }

  public async getAll(params: QueryParamsDto): Promise<PaginatedResponse<UserWithRelationsWithoutPassword>> {
    const result = await super.getPaginatedResult<UserWithRoles>({
      model: this.prisma.user,
      params,
      include: { roles: { include: { role: true } }, profile: { include: { author: true } } },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeUsers = result.items.map(({ hashedPassword, ...rest }) => rest);

    return {
      ...result,
      items: safeUsers.map((user) => ({
        ...user,
        roles: user.roles.sort((a, b) => a.role.priority - b.role.priority).map((userRole) => userRole.role.name),
      })),
    };
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
    await this.prisma.userRole.deleteMany({ where: { userId } });
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

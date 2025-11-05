import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { User, UserRole } from '@/generated/prisma';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';
import { ROLES } from '@/shared/constants/roles';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { RolesService } from '../roles/roles.service';
import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FullUser } from './types/user.type';
import * as usersController from './users-controller-swagger.decorators';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @usersController.ApiGetAllUsers()
  @UseGuards(JwtAccessGuard)
  @Get()
  public async getAll(
    @CurrentUser() user: FullUser | null,
    @Query() query: QueryParamsDto,
  ): Promise<PaginatedResponse<FullUser>> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.usersService.getAll(query);
  }

  @usersController.ApiGetCurrentUser()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  public getCurrentUser(@CurrentUser() currentUser: FullUser | null): FullUser | null {
    return currentUser;
  }

  @usersController.ApiGetOneUser()
  @UseGuards(JwtAccessGuard)
  @Get(':userId')
  public async getOne(@Param('userId', ParseIntPipe) id: number): Promise<FullUser> {
    return this.usersService.getOne({ id });
  }

  @usersController.ApiUpdateOneUser()
  @Patch(':userId')
  public async updateOne(@Body() dto: UpdateUserDto, @Param('userId', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.updateOne({ where: { id }, data: dto });
  }

  @usersController.ApiDeleteAllUsers()
  @UseGuards(JwtAccessGuard)
  @Delete()
  public async deleteAll(@CurrentUser() user: FullUser | null): Promise<BatchPayload> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.usersService.deleteAll();
  }

  @UseGuards(JwtAccessGuard)
  @Delete(':userId')
  public async deleteOne(
    @Param('userId', ParseIntPipe) id: number,
    @CurrentUser() user: FullUser | null,
  ): Promise<User> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.usersService.deleteOne({ id });
  }

  @usersController.ApiAddRoleToUser()
  @UseGuards(JwtAccessGuard)
  @Patch(':userId/roles/:roleName')
  public async addRole(
    @Param('userId', ParseIntPipe) id: number,
    @Param('roleName') roleName: string,
    @CurrentUser() user: FullUser | null,
  ): Promise<UserRole> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.usersService.addRoleToUser({ id }, roleName);
  }

  @usersController.ApiRemoveRoleFromUser()
  @UseGuards(JwtAccessGuard)
  @Delete(':userId/roles/:roleName')
  public async removeRole(
    @Param('userId', ParseIntPipe) id: number,
    @Param('roleName') roleName: string,
    @CurrentUser() user: FullUser | null,
  ): Promise<UserRole> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.usersService.removeRoleFromUser({ id }, roleName);
  }

  @usersController.ApiCheckAvailableEmail()
  @Post('email-check')
  public async checkAvailableEmail(@Body() { email }: CheckEmailDto): Promise<boolean> {
    return this.usersService.checkAvailableEmail(email);
  }
}

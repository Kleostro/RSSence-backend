import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { RoleGuard } from '@/core/guards/role.guard';
import { User, UserRole } from '@/generated/prisma';
import { ROLES } from '@/shared/constants/roles';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FullUserInfoType, UserWithRelationsWithoutPassword } from './types/types';
import * as usersController from './users-controller-swagger.decorators';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @usersController.ApiGetAllUsers()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Get()
  public async getAll(@Query() query: QueryParamsDto): Promise<PaginatedResponse<UserWithRelationsWithoutPassword>> {
    return this.usersService.getAll(query);
  }

  @usersController.ApiGetCurrentUser()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  public getCurrentUser(@CurrentUser() currentUser: FullUserInfoType | null): FullUserInfoType | null {
    return currentUser;
  }

  @usersController.ApiGetOneUser()
  @UseGuards(JwtAccessGuard)
  @Get(':userId')
  public async getOne(@Param('userId', ParseIntPipe) id: number): Promise<FullUserInfoType> {
    return this.usersService.getOne({ id });
  }

  @usersController.ApiUpdateOneUser()
  @Patch(':userId')
  public async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, id);
  }

  @usersController.ApiDeleteAllUsers()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.usersService.deleteAll();
  }

  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Delete(':userId')
  public async deleteOne(@Param('userId', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteOne(id);
  }

  @usersController.ApiAddRoleToUser()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Patch(':userId/roles/:roleName')
  public async addRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleName') roleName: string,
  ): Promise<UserRole> {
    return this.usersService.addRoleToUser(userId, roleName);
  }

  @usersController.ApiRemoveRoleFromUser()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Delete(':userId/roles/:roleName')
  public async removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleName') roleName: string,
  ): Promise<UserRole> {
    return this.usersService.removeRoleFromUser(userId, roleName);
  }

  @usersController.ApiCheckAvailableEmail()
  @Post('email-check')
  public async checkAvailableEmail(@Body() { email }: CheckEmailDto): Promise<boolean> {
    return this.usersService.checkAvailableEmail(email);
  }
}

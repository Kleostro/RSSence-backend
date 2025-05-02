import { RoleGuard } from '@/core/guards/role.guard';
import { ROLES } from '@/shared/constants/roles';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithRelationsWithoutPassword } from './types/types';
import * as usersController from './users-controller-swagger.decorators';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @usersController.ApiGetAllUsers()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.MODERATOR, ROLES.ADMIN)
  @Get()
  public async getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @usersController.ApiGetCurrentUser()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  public async getCurrentUser(@CurrentUser('id', ParseIntPipe) id: number): Promise<UserWithRelationsWithoutPassword> {
    const user = await this.usersService.getOne({ id });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @usersController.ApiGetOneUser()
  @UseGuards(JwtAccessGuard)
  @Get(':userId')
  public async getOne(@Param('userId', ParseIntPipe) id: number): Promise<UserWithRelationsWithoutPassword> {
    const user = await this.usersService.getOne({ id });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @usersController.ApiUpdateCurrentUser()
  @UseGuards(JwtAccessGuard)
  @Patch('me')
  public async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, userId);
  }

  @usersController.ApiUpdateOneUser()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.MODERATOR, ROLES.ADMIN)
  @Patch(':userId')
  public async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, id);
  }

  @usersController.ApiDeleteAllUsers()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.usersService.deleteAll();
  }

  @usersController.ApiDeleteCurrentUser()
  @UseGuards(JwtAccessGuard)
  @Delete('me')
  public async deleteCurrentUser(@CurrentUser('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.deleteOne(userId);
  }

  @usersController.ApiDeleteOneUser()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.MODERATOR, ROLES.ADMIN)
  @Delete(':userId')
  public async deleteOne(@Param('userId', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteOne(id);
  }

  @usersController.ApiAddRoleToUser()
  @Post(':userId/roles/:roleName')
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  public async addRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleName') roleName: string,
  ): Promise<UserRole> {
    return this.usersService.addRoleToUser(userId, roleName);
  }

  @usersController.ApiRemoveRoleFromUser()
  @Delete(':userId/roles/:roleName')
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
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

import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as usersController from './users-controller-swagger.decorators';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @usersController.ApiGetAllUsers()
  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  public async getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @usersController.ApiGetCurrentUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Get('current-user')
  public async getCurrentUser(@CurrentUser('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getOne({ id });
  }

  @usersController.ApiGetOneUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Get(':id')
  public async getOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getOne({ id });
  }

  @usersController.ApiUpdateCurrentUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Patch('current-user')
  public async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, userId);
  }

  @usersController.ApiUpdateOneUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Patch(':id')
  public async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, id);
  }

  @usersController.ApiDeleteAllUsers()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.usersService.deleteAll();
  }

  @usersController.ApiDeleteCurrentUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete('current-user')
  public async deleteCurrentUser(@CurrentUser('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.deleteOne(userId);
  }

  @usersController.ApiDeleteOneUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':id')
  public async deleteOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteOne(id);
  }

  @usersController.ApiCheckAvailableEmail()
  @Post('email-check')
  public async checkAvailableEmail(@Body() { email }: CheckEmailDto): Promise<boolean> {
    return this.usersService.checkAvailableEmail(email);
  }
}

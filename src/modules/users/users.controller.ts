import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as usersSwagger from './users-controller-swagger.decorators';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @usersSwagger.ApiGetAllUsers()
  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  public async getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @usersSwagger.ApiGetCurrentUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Get('current-user')
  public async getCurrentUser(@CurrentUser('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getOne({ id });
  }

  @usersSwagger.ApiGetOneUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Get(':id')
  public async getOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getOne({ id });
  }

  @usersSwagger.ApiUpdateCurrentUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Patch('current-user')
  public async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, userId);
  }

  @usersSwagger.ApiUpdateOneUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Patch(':id')
  public async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, id);
  }

  @usersSwagger.ApiDeleteAllUsers()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.usersService.deleteAll();
  }

  @usersSwagger.ApiDeleteCurrentUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete('current-user')
  public async deleteCurrentUser(@CurrentUser('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.deleteOne(userId);
  }

  @usersSwagger.ApiDeleteOneUser()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':id')
  public async deleteOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteOne(id);
  }

  @usersSwagger.ApiCheckAvailableEmail()
  @Post('email-check')
  public async checkAvailableEmail(@Body() { email }: CheckEmailDto): Promise<boolean> {
    return this.usersService.checkAvailableEmail(email);
  }
}

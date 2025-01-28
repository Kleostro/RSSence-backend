import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  public async getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('me')
  public async getOne(@CurrentUser('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.getOne({ id });
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get(':id')
  public async getById(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.getOne({ id });
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Patch('me')
  public async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, userId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Patch(':id')
  public async updateById(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, id);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.usersService.deleteAll();
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete('me')
  public async deleteOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.deleteOne(userId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':id')
  public async deleteById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteOne(id);
  }

  @Post('email-check')
  public async checkAvailableEmail(@Body() { email }: CheckEmailDto): Promise<boolean> {
    return this.usersService.checkAvailableEmail(email);
  }
}

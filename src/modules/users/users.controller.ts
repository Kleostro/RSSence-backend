import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CheckEmailDto } from './dto/check-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAccessGuard)
  @Get()
  public async getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @UseGuards(JwtAccessGuard)
  @Get('me')
  public async getOne(@CurrentUser('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.getOne({ id });
  }

  @UseGuards(JwtAccessGuard)
  @Get(':id')
  public async getById(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.getOne({ id });
  }

  @UseGuards(JwtAccessGuard)
  @Patch('me')
  public async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, userId);
  }

  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  public async updateById(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.updateOne(updateUserDto, id);
  }

  @UseGuards(JwtAccessGuard)
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.usersService.deleteAll();
  }

  @UseGuards(JwtAccessGuard)
  @Delete('me')
  public async deleteOne(@CurrentUser('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.deleteOne(userId);
  }

  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  public async deleteById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deleteOne(id);
  }

  @Post('email-check')
  public async checkAvailableEmail(@Body() { email }: CheckEmailDto): Promise<boolean> {
    return this.usersService.checkAvailableEmail(email);
  }
}

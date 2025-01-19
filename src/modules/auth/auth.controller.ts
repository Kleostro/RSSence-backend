import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  public async register(@Body() dto: CreateUserDto): Promise<User> {
    return this.authService.register(dto);
  }

  @Get()
  public login(@Body() dto: CreateUserDto): Promise<User> {
    return this.authService.login(dto);
  }
}

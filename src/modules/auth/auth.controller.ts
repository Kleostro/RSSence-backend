import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  public register(@Body() registerDto: RegisterDto): Promise<User | null> {
    return this.authService.register(registerDto);
  }

  @Get()
  public login(@Body() loginDto: LoginDto): Promise<User | null> {
    return this.authService.login(loginDto);
  }
}

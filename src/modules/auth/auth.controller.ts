import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  public register(@Body() registerDto: RegisterDto): Promise<User | null> {
    return this.authService.register(registerDto);
  }
}

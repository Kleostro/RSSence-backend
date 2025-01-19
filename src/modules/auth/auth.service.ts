import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    await this.usersService.isEmailExist(registerDto.email);

    return this.prisma.user.create({
      data: {
        email: registerDto.email.toLowerCase(),
        password: hashedPassword,
      },
    });
  }

  public async login(loginDto: LoginDto): Promise<User | null> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new NotFoundException('Invalid credentials!');
    }

    return user;
  }

  public async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordsMatch = await bcrypt.compare(pass, user.password);
    if (isPasswordsMatch) {
      return user;
    }
    return null;
  }
}

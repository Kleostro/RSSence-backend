import * as bcrypt from 'bcrypt';

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private HASH_SALT = 10;

  constructor(private usersService: UsersService) {}

  public async register(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, this.HASH_SALT);
    const userDto = { ...dto, email: dto.email.toLowerCase(), password: hashedPassword };

    return this.usersService.createOne(userDto);
  }

  public async login(dto: CreateUserDto): Promise<User> {
    return this.validateUser(dto.email, dto.password);
  }

  private async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    const isPasswordsMatch = await bcrypt.compare(pass, user.password);
    if (!isPasswordsMatch) {
      throw new NotFoundException('Invalid credentials!');
    }

    return user;
  }
}

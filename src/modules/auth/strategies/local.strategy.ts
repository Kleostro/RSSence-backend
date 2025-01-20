import { Strategy } from 'passport-local';

import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  public async validate(email: string, password: string): Promise<User | null> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new NotFoundException('Invalid credentials!');
    }

    return user;
  }
}

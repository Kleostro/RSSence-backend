import { Response } from 'express';

import { normalizeEmail } from '@/shared/utils/normalizeEmail';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './services/password/password.service';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_OPTIONS = {
    httpOnly: true,
    secure: true,
  };

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async register({ email, password }: RegisterDto, res: Response): Promise<{ accessToken: string }> {
    const hashedPassword = await this.passwordService.hash(password);

    const createdUser = await this.usersService.createOne({ email: normalizeEmail(email), hashedPassword });

    return this.generateTokens(createdUser.id, res);
  }

  public async googleAuth(email: string, res: Response): Promise<{ accessToken: string }> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.usersService.getOne({ email: normalizedEmail });

    if (user) {
      return this.generateTokens(user.id, res);
    }

    const createdUser = await this.usersService.createOne({ email: normalizedEmail });

    return this.generateTokens(createdUser.id, res);
  }

  public async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.getOne({ email: normalizeEmail(email) });

    if (!user?.hashedPassword) {
      // TBD: send the auto-generated password to user email
      return null;
    }

    const isPasswordValid = await this.passwordService.verify(pass, user.hashedPassword);

    return isPasswordValid ? user : null;
  }

  public async generateTokens(userId: number, res: Response): Promise<{ accessToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(userId, 'JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRES'),
      this.generateToken(userId, 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES'),
    ]);

    res.cookie('refreshToken', refreshToken, this.ACCESS_TOKEN_OPTIONS);

    return { accessToken };
  }

  private async generateToken(userId: number, secretKey: string, expiresKey: string): Promise<string> {
    return this.jwt.signAsync(
      { userId },
      {
        secret: this.config.getOrThrow(secretKey),
        expiresIn: this.config.getOrThrow(expiresKey),
      },
    );
  }
}

import { JwtPayloadType } from '@/shared/types/jwt-payload';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokensDto } from '../../dto/tokens.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async generatePasswordResetToken(userId: number): Promise<string> {
    return this.generateToken(userId, 'JWT_PASSWORD_RESET_SECRET', 'JWT_PASSWORD_RESET_EXPIRES');
  }

  public async generateAuthTokens(userId: number): Promise<TokensDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(userId, 'JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRES'),
      this.generateToken(userId, 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES'),
    ]);

    return { accessToken, refreshToken };
  }

  public async verifyToken(token: string, secretKey: string): Promise<JwtPayloadType> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayloadType>(token, {
        secret: this.config.getOrThrow(secretKey),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
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

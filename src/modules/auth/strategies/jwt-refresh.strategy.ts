import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserWithProfileAndAuthor } from '@/modules/users/types/user.type';
import { UsersService } from '@/modules/users/users.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { JwtPayloadType } from '@/shared/types/jwt-payload';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request): string => req.cookies['refreshToken']]),
      ignoreExpiration: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  public async validate({ userId }: JwtPayloadType): Promise<UserWithProfileAndAuthor & { roles: string[] }> {
    const user = await this.usersService.getOne({ id: Number(userId) });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_UNAUTHORIZED);
    }

    return user;
  }
}

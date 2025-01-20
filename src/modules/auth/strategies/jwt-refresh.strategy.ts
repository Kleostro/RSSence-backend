import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '@/modules/users/users.service';
import { JwtPayloadType } from '@/shared/types/jwt-payload';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';

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

  public async validate({ userId }: JwtPayloadType): Promise<User | null> {
    const user = await this.usersService.getOne({ id: Number(userId) });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

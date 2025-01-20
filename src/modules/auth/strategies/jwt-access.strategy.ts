import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '@/modules/users/users.service';
import { JwtPayloadType } from '@/shared/types/jwt-payload';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
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

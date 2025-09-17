import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserWithProfileAndAuthor } from '@/modules/users/types/user.type';
import { UsersService } from '@/modules/users/users.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { JwtPayloadType } from '@/shared/types/jwt-payload';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

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

  public async validate({ userId }: JwtPayloadType): Promise<UserWithProfileAndAuthor & { roles: string[] }> {
    const user = await this.usersService.getOne({ id: Number(userId) });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_UNAUTHORIZED);
    }

    return user;
  }
}

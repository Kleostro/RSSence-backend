import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '@/generated/prisma';
import { PrismaService } from '@/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { JwtPayloadType } from '@/shared/types/jwt-payload';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  public async validate({ userId }: JwtPayloadType): Promise<(User & { roles: string[] }) | null> {
    const user = await this.getUserById(Number(userId));

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_UNAUTHORIZED);
    }

    return user;
  }

  private async getUserById(id: number): Promise<(User & { roles: string[] }) | null> {
    if (!id) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const user = await this.prisma.user.findFirst({
      where: { id },
      include: { roles: { include: { role: true } }, author: true, profile: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      ...user,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
  }
}

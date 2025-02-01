import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleGuard } from './guards/google.guard';
import { EmailService } from './services/email/email.service';
import { PasswordService } from './services/password/password.service';
import { TokenService } from './services/token/token.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    GoogleGuard,
    GoogleStrategy,
    PasswordService,
    EmailService,
    TokenService,
    PrismaService,
  ],
})
export class AuthModule {}

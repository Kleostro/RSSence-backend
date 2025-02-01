import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './services/email/email.service';
import { PasswordService } from './services/password/password.service';
import { TokenService } from './services/token/token.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        ConfigService,
        JwtService,
        PasswordService,
        EmailService,
        MailerService,
        RolesService,
        TokenService,
        {
          name: MAILER_OPTIONS,
          provide: MAILER_OPTIONS,
          useValue: {
            transport: {
              secure: true,
              auth: {
                user: 'user@domain.com',
                pass: 'pass',
              },
              options: {
                host: 'smtp.domain.com',
              },
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

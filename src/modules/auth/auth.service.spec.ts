import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { EmailService } from './services/email/email.service';
import { PasswordService } from './services/password/password.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        ConfigService,
        JwtService,
        PasswordService,
        EmailService,
        MailerService,
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

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

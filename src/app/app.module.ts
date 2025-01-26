import { env } from 'process';

import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../modules/auth/auth.module';
import { PrismaService } from '../prisma.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: env['EMAIL_HOST'],
        secure: true,
        auth: {
          user: env['EMAIL_USER'],
          pass: env['EMAIL_PASSWORD'],
        },
      },
    }),
  ],
  providers: [PrismaService, AppGateway],
})
export class AppModule {}

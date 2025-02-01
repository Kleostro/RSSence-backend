import { env } from 'process';

import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from '../modules/auth/auth.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
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
  providers: [AppGateway],
})
export class AppModule {}

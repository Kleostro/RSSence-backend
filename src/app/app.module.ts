import { env } from 'process';

import { PrismaModule } from '@/prisma/prisma.module';
import { ImagesModule } from '@/shared/modules/images/images.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from '../modules/auth/auth.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    ImagesModule,
    PrismaModule,
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

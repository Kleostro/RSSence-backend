import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../modules/auth/auth.module';
import { PrismaService } from '../prisma.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
  providers: [PrismaService, AppGateway],
})
export class AppModule {}

import { AuthModule } from '@/modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppGateway } from './app.gateway';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
  providers: [AppGateway],
})
export class AppModule {}

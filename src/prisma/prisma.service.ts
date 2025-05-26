import { PrismaClient } from '@/generated/prisma';
import { Global, Injectable, OnModuleInit } from '@nestjs/common';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public async onModuleInit(): Promise<void> {
    await this['$connect']();
  }
}

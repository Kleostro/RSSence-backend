import { PrismaClient } from '@/generated/prisma';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public async onModuleInit(): Promise<void> {
    await this['$connect']();
  }
}

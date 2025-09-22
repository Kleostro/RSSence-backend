import { PrismaClient } from '@/generated/prisma';
import { Global, Injectable, OnModuleInit } from '@nestjs/common';

import { prismaMiddleware } from './prisma.middleware';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    prismaMiddleware(this);
  }

  public async onModuleInit(): Promise<void> {
    await this['$connect']();
  }
}

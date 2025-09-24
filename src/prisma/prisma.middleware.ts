/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('Prisma Middleware');

export const prismaMiddleware = (prisma: PrismaClient): any => {
  prisma.$use(async (params: { action: any; model: any }, next: (arg0: any) => any) => {
    const start = Date.now();
    const result = await next(params);
    const end = Date.now();
    const duration = end - start;
    const { action, model } = params;
    logger.verbose(`[${action}] ${model} | ${duration}ms`);
    return result;
  });
};

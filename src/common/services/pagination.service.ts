/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@/generated/prisma';

import { PaginatedResponse } from '../interfaces/pagination.interface';

interface PaginationProps<Args> {
  model: any;
  args?: Args & { where?: Record<string, unknown> };
  page?: number;
  limit?: number;
}

export abstract class PaginationService {
  constructor(protected readonly prisma: PrismaClient) {}

  public async getPaginatedResult<T, Args extends Prisma.Args<unknown, 'findMany'>>({
    model,
    args,
    page = 1,
    limit = 10,
  }: PaginationProps<Args>): Promise<PaginatedResponse<T>> {
    try {
      const { list: items, count: total } = await this.prisma.$transaction(async () => {
        const list = await model.findMany({ ...args, skip: (page - 1) * limit, take: limit });
        const count = await model.count({ where: args?.where });
        return { list, count };
      });

      const first = (page - 1) * limit;

      return {
        items,
        total,
        page: page ?? 1,
        limit: limit ?? 10,
        totalPages: Math.ceil(total / (limit ?? 10)),
        hasMore: (page ?? 1) * (limit ?? 10) < total,
        first,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 1, hasMore: false, first: 0 };
    }
  }
}

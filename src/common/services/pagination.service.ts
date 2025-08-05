/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@/generated/prisma';

import { QueryParamsDto } from '../dto/query-params.dto';
import { PaginatedResponse } from '../interfaces/pagination.interface';

export abstract class PaginationService {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly defaultSortField = 'id',
    protected readonly defaultSearchField = 'id',
  ) {}

  // eslint-disable-next-line max-lines-per-function
  public async getPaginatedResult<T>(data: {
    model: any;
    params: QueryParamsDto;
    additionalWhere?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }): Promise<PaginatedResponse<T>> {
    const { page, limit, sortBy, sortOrder, search, searchField } = data.params;

    const effectiveSortField = sortBy || this.defaultSortField;
    const effectiveSearchField = searchField || this.defaultSearchField;

    const baseWhere = {
      ...(search && { [effectiveSearchField]: { contains: search, mode: 'insensitive' } }),
    };

    const where = {
      ...baseWhere,
      ...data.additionalWhere,
    };

    try {
      const [items, total] = await this.prisma.$transaction([
        data.model.findMany({
          where,
          include: data.include,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [effectiveSortField]: sortOrder },
        }),
        data.model.count({ where }),
      ]);

      return {
        items,
        total,
        page: page ?? 1,
        limit: limit ?? 10,
        totalPages: Math.ceil(total / (limit ?? 10)),
        hasMore: (page ?? 1) * (limit ?? 10) < total,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false,
      };
    }
  }
}

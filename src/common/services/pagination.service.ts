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
    model?: any;
    params?: QueryParamsDto;
    additionalWhere?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }): Promise<PaginatedResponse<T>> {
    const { model, params, additionalWhere = {}, include = {} } = data;

    const effectiveSortField = params?.sortBy || this.defaultSortField;
    const effectiveSearchField = params?.searchField || this.defaultSearchField;

    const where = {
      ...additionalWhere,
      ...(params?.search && { [effectiveSearchField]: { contains: params.search, mode: 'insensitive' } }),
    };

    try {
      const [items, total] = await this.prisma.$transaction([
        model.findMany({
          where,
          include,
          skip: params?.page && (params.page - 1) * params.limit,
          take: params?.limit,
          orderBy: { [effectiveSortField]: params?.sortOrder || 'asc' },
        }),
        model.count({ where }),
      ]);

      return {
        items,
        total,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: Math.ceil(total / (params?.limit ?? 10)),
        hasMore: (params?.page ?? 1) * (params?.limit ?? 10) < total,
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

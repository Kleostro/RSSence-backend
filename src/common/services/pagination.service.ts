/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@/generated/prisma';

import { QueryParamsDto } from '../dto/query-params.dto';
import { PaginatedResponse } from '../interfaces/pagination.interface';

export abstract class PaginationService<T> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly defaultSortField = 'createdAt',
    protected readonly defaultSearchField = 'title',
  ) {}

  public async getPaginatedResult(
    model: any,
    params: QueryParamsDto,
    additionalWhere: Record<string, unknown> = {},
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, sortBy, sortOrder, search, searchField } = params;

    const effectiveSortField = sortBy || this.defaultSortField;
    const effectiveSearchField = searchField || this.defaultSearchField;

    const where = {
      ...additionalWhere,
      ...(search && { [effectiveSearchField]: { contains: search } }),
    };

    const [items, total] = await this.prisma.$transaction([
      model.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [effectiveSortField]: sortOrder || 'asc' },
      }),
      model.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }
}

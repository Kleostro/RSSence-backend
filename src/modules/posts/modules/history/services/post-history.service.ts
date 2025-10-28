import { PaginationService } from '@/common/services/pagination.service';
import { PostHistory, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostHistoryService extends PaginationService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public getAll(where: Prisma.PostHistoryWhereInput): Promise<PostHistory[]> {
    return this.prisma.postHistory.findMany({ where, include: { author: true } });
  }

  public async createOne(data: Prisma.PostHistoryCreateManyInput): Promise<PostHistory> {
    return this.prisma.postHistory.create({ data, include: { author: true } });
  }
}

import { IsIn, IsOptional } from 'class-validator';

import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { Prisma } from '@/generated/prisma';

export class AuthorQueryParamsDto extends QueryParamsDto {
  @IsOptional()
  @IsIn(Object.keys({ ...Prisma.AuthorScalarFieldEnum }))
  public override searchField?: Prisma.AuthorScalarFieldEnum;

  @IsOptional()
  @IsIn(Object.keys({ ...Prisma.AuthorScalarFieldEnum }))
  public override filterField?: Prisma.AuthorScalarFieldEnum;
}

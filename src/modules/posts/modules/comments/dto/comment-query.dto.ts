import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

import { QueryParamsDto } from '@/common/dto/query-params.dto';

export class CommentQueryDto extends QueryParamsDto {
  @IsOptional()
  public sort?: string = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  public parentId?: number;
}

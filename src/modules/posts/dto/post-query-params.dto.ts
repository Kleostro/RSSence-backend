import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PostStatus, Prisma } from '@/generated/prisma';
import { BadRequestException } from '@nestjs/common';

import { PostSortBy } from '../interfaces/post-sort-by';

export class PostQueryParamsDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  @IsIn(
    Object.values({
      ...Prisma.PostScalarFieldEnum,
      ...Prisma.AuthorScalarFieldEnum,
    }),
  )
  public override searchField?: Prisma.PostScalarFieldEnum | Prisma.AuthorScalarFieldEnum;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.values(PostStatus), { each: true })
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return [value];
    }

    throw new BadRequestException('Invalid status format. Expected string or array.');
  })
  public status?: PostStatus[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    throw new BadRequestException('Invalid value for isMainAuthor');
  })
  public isMainAuthor?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(PostSortBy), {
    message: `sortBy must be one of: ${Object.values(PostSortBy).join(', ')}`,
  })
  public override sortBy?: PostSortBy;
}

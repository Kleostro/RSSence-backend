import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @Transform(({ value }) => Math.max(1, Number(value)))
  @IsPositive()
  public page = 1;

  @IsOptional()
  @Transform(({ value }) => Math.min(100, Math.max(1, Number(value))))
  @IsPositive()
  public limit = 10;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public sortBy = 'id';

  @IsOptional()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  public search?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public searchField?: string;

  @IsOptional()
  @IsString()
  public filter?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public filterField?: string;
}

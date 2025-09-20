import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class PostViewQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public start?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public end?: Date;

  @IsOptional()
  @IsString()
  public interval?: 'day' | 'week' | 'month';
}

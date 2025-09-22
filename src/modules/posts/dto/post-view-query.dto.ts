import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

import { IsDateInRange } from '@/shared/validators/is-date-in-range.validator';

export class PostViewQueryDto {
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @IsDateInRange({ minDate: null, maxDate: new Date() }, { message: 'Start must be a valid date in the past' })
  public start?: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @IsDateInRange({ minDate: null, maxDate: new Date() }, { message: 'End must be a valid date in the past' })
  public end?: Date;
}

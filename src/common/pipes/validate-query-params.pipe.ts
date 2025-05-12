import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { QueryParamsDto } from '../dto/query-params.dto';

@Injectable()
export class ValidateQueryParamsPipe<T> implements PipeTransform<string, Promise<T>> {
  constructor(private readonly allowedFields: string[]) {}

  public async transform(value: string): Promise<T> {
    const dto = plainToClass(QueryParamsDto, value);

    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (dto.searchField && !this.allowedFields.includes(dto.searchField)) {
      throw new BadRequestException(
        `Invalid search field: ${dto.searchField}. Allowed fields: ${this.allowedFields.join(', ')}`,
      );
    }

    if (dto.sortBy && !this.allowedFields.includes(dto.sortBy)) {
      throw new BadRequestException(
        `Invalid sort field: ${dto.sortBy}. Allowed fields: ${this.allowedFields.join(', ')}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return dto as T;
  }
}

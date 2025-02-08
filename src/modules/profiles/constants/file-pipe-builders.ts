import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

export const AVATAR_VALIDATION_PIPE = new ParseFilePipeBuilder()
  .addFileTypeValidator({ fileType: 'image' })
  .addMaxSizeValidator({ maxSize: 8 * 1024 * 1024 })
  .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST, fileIsRequired: false });

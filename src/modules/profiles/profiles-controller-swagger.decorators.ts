import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CheckUsernameDto } from './dto/check-username';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export function ApiGetMeProfile(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current profile',
      description: 'Retrieve the current user profile.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the current user profile.',
      type: CreateProfileDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The profile does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiCreateMeProfile(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new profile',
      description: 'Creates a new profile for the current user.',
    }),
    ApiBearerAuth('bearer'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: false,
      type: CreateProfileDto,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Returns the created profile.',
      type: CreateProfileDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request. The data provided is invalid.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict. Attempting to reuse unique data.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiUpdateMeProfile(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update current profile',
      description: 'Updates the current user profile.',
    }),
    ApiBearerAuth('bearer'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: false,
      type: UpdateProfileDto,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the updated profile.',
      type: UpdateProfileDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The profile does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict. Attempting to reuse unique data.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiDeleteMeProfile(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete current profile',
      description: 'Deletes the current user profile.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully deleted the profile.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The profile does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiCheckAvailableUsername(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Check if a username is available',
      description: 'Check if a given username is already registered.',
    }),
    ApiBearerAuth('bearer'),
    ApiBody({
      required: true,
      type: CheckUsernameDto,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns whether the username is available.',
      schema: { type: 'boolean' },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request. The data provided is invalid.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

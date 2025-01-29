import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CheckEmailDto } from './dto/check-email.dto';
import { UserDto } from './dto/user.dto';

export function ApiGetAllUsers(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all users',
      description: 'Retrieve a list of all users.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns a list of all users.',
      type: [UserDto],
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiGetCurrentUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current user',
      description: 'Retrieve a current user.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns a current user.',
      type: UserDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiGetOneUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieve a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'id',
      example: 1,
      required: true,
      description: 'The ID of the user to retrieve.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the user with the specified ID.',
      type: UserDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The user with the specified ID does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiUpdateCurrentUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update current user',
      description: 'Update a current user.',
    }),
    ApiBearerAuth('bearer'),
    ApiBody({
      required: false,
      type: UserDto,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the updated current user.',
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

export function ApiUpdateOneUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user by ID',
      description: 'Update a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiBody({
      required: false,
      type: UserDto,
    }),
    ApiParam({
      name: 'id',
      example: 1,
      required: true,
      description: 'The ID of the user to update.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the updated user.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The user with the specified ID does not exist.',
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

export function ApiDeleteAllUsers(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete all users',
      description: 'Delete all users.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully deleted all users.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiDeleteOneUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user by ID',
      description: 'Delete a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'id',
      example: 1,
      required: true,
      description: 'The ID of the user to delete.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully deleted the user.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The user with the specified ID does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiDeleteCurrentUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete current user',
      description: 'Delete a current user.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully deleted a current user.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
  );
}

export function ApiCheckAvailableEmail(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Check if an email is available',
      description: 'Check if a given email address is already registered.',
    }),
    ApiBody({
      required: true,
      type: CheckEmailDto,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns whether the email is available.',
      schema: { type: 'boolean' },
    }),
  );
}

import { ROLES } from '@/shared/constants/roles';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CheckEmailDto } from './dto/check-email.dto';

export function ApiGetAllUsers(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Get all users (requires role ${ROLES.MODERATOR} or ${ROLES.ADMIN})`,
      description: 'Retrieve a list of all users.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns a list of all users.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
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
      summary: `Get user by ID (requires role ${ROLES.MODERATOR} or ${ROLES.ADMIN})`,
      description: 'Retrieve a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'userId',
      example: 1,
      required: true,
      description: 'The ID of the user to retrieve.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the user with the specified ID.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The user with the specified ID does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
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
      summary: `Update user by ID (requires role ${ROLES.MODERATOR} or ${ROLES.ADMIN})`,
      description: 'Update a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiBody({
      required: false,
    }),
    ApiParam({
      name: 'userId',
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
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
    }),
  );
}

export function ApiDeleteAllUsers(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Delete all users (requires role ${ROLES.ADMIN})`,
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
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
    }),
  );
}

export function ApiDeleteOneUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Delete user by ID (requires role ${ROLES.MODERATOR} or ${ROLES.ADMIN})`,
      description: 'Delete a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'userId',
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
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
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

export function ApiAddRoleToUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Add role to user by ID (requires role ${ROLES.ADMIN})`,
      description: 'Add a role to a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'userId',
      example: 1,
      required: true,
      description: 'The ID of the user to add the role to.',
    }),
    ApiParam({
      name: 'roleName',
      example: 'ADMIN',
      required: true,
      description: 'The name of the role to add to the user.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully added the role to the user.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The user or role does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
    }),
  );
}

export function ApiRemoveRoleFromUser(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Remove role from user by ID (requires role ${ROLES.ADMIN})`,
      description: 'Remove a role from a user by their ID.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'userId',
      example: 1,
      required: true,
      description: 'The ID of the user to remove the role from.',
    }),
    ApiParam({
      name: 'roleName',
      example: 'ADMIN',
      required: true,
      description: 'The name of the role to remove from the user.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully removed the role from the user.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The user or role does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired access token.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
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

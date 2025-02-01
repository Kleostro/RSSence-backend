import { ROLES } from '@/shared/constants/roles';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CreateRoleDto } from './dto/create-role.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

export function ApiGetAllRoles(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Get all roles (requires role ${ROLES.ADMIN})`,
      description: 'Retrieve a list of all roles.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns a list of all roles.',
      type: [RoleDto],
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

export function ApiGetOneRole(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Get role by its name (requires role ${ROLES.ADMIN})`,
      description: 'Retrieve a role by its name.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'roleName',
      description: 'The name of the role.',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the role.',
      type: RoleDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The role does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request. The data provided is invalid.',
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

export function ApiCreateRole(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Create a new role (requires role ${ROLES.ADMIN})`,
      description: 'Create a new role.',
    }),
    ApiBearerAuth('bearer'),
    ApiBody({
      required: true,
      type: CreateRoleDto,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Returns the created role.',
      type: RoleDto,
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
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden. User does not have the required role.',
    }),
  );
}

export function ApiDeleteOneRole(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Delete role by its name (requires role ${ROLES.ADMIN})`,
      description: 'Delete a role by its name.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'roleName',
      description: 'The name of the role.',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully deleted the role.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The role does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request. The data provided is invalid.',
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

export function ApiUpdateOneRole(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Update role by its name (requires role ${ROLES.ADMIN})`,
      description: 'Update a role by its name.',
    }),
    ApiBearerAuth('bearer'),
    ApiParam({
      name: 'roleName',
      description: 'The name of the role.',
      required: true,
    }),
    ApiBody({
      required: false,
      type: UpdateRoleDto,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the updated role.',
      type: RoleDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. The role does not exist.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request. The data provided is invalid.',
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

export function ApiDeleteAllRoles(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: `Delete all roles (requires role ${ROLES.ADMIN})`,
      description: 'Delete all roles.',
    }),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully deleted all roles.',
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

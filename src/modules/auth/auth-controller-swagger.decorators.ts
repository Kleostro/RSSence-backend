import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthDto } from './dto/auth.dto';
import { TokensDto } from './dto/tokens.dto';

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'Registers a new user with the provided email and password.',
    }),
    ApiBody({
      required: true,
      type: AuthDto,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Returns an access and refresh tokens upon successful registration.',
      type: TokensDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request. The email or password is invalid.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict. Attempting to reuse unique data.',
    }),
  );
}

export function ApiLogin(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Login a user',
      description: 'Logs in a user with the provided email and password.',
    }),
    ApiBody({
      required: true,
      type: AuthDto,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Returns an access and refresh tokens upon successful login.',
      type: TokensDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. A user with these credentials was not found.',
    }),
  );
}

export function ApiRefreshToken(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description: 'Refreshes the access token using a refresh token.',
    }),
    ApiCookieAuth('refreshToken'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns a new access and refresh tokens upon successful refresh.',
      type: TokensDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired refresh token.',
    }),
  );
}

export function ApiLogout(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout a user',
      description: 'Logs out a user by clearing the refresh token cookie.',
    }),
    ApiCookieAuth('refreshToken'),
    ApiBearerAuth('bearer'),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully logged out the user.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired refresh token.',
    }),
  );
}

export function ApiGoogleAuth(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth2 authentication',
      description: 'Starts the Google OAuth2 authentication flow.',
    }),
  );
}

export function ApiGoogleCallback(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth2 callback',
      description: 'Handles the callback from Google OAuth2 after successful authentication.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns an access and refresh tokens upon successful Google authentication.',
      type: TokensDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Failed to authenticate with Google.',
    }),
  );
}

export function ApiChangePassword(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Change user password',
      description: 'Changes the user password using the provided email.',
    }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'john_doe@gmail.com' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully initiated password change process.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not found. A user with these credentials was not found.',
    }),
  );
}

export function ApiResetPassword(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Reset user password',
      description: 'Resetting the password using the token provided and a new password.',
    }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'unique_token_here' },
          newPassword: { type: 'string', example: 'new_password' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successful password change.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized. Invalid or expired refresh token.',
    }),
  );
}

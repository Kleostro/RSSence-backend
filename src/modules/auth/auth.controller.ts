import { Request, Response } from 'express';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Get, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiChangePassword,
  ApiGoogleAuth,
  ApiGoogleCallback,
  ApiLogin,
  ApiLogout,
  ApiRefreshToken,
  ApiRegister,
  ApiResetPassword,
} from './auth-controller-swagger.decorators';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleGuard } from './guards/google.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiRegister()
  @Post('register')
  public async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.register(dto, res);
  }

  @ApiLogin()
  @Post('login')
  public async login(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(dto, res);
  }

  @ApiRefreshToken()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  public async refreshToken(
    @CurrentUser('id', ParseIntPipe) userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.generateTokens(userId, res);
  }

  @ApiLogout()
  @UseGuards(AuthGuard('jwt-access'))
  @Post('logout')
  public logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.cookie('refreshToken', '');
    return { message: 'Successfully logged out the user' };
  }

  @ApiGoogleAuth()
  @UseGuards(GoogleGuard)
  @Get('google')
  public googleAuth(): void {}

  @ApiGoogleCallback()
  @UseGuards(GoogleGuard)
  @Get('google/callback')
  public async googleCallback(
    @Req() req: Request & { user: { _json: { email: string } } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // eslint-disable-next-line no-underscore-dangle
    return this.authService.googleAuth(req.user._json.email, res);
  }

  @ApiChangePassword()
  @Post('change-password')
  public async changePassword(@Body() { email }: { email: string }): Promise<void> {
    return this.authService.requestPasswordChange(email);
  }

  @ApiResetPassword()
  @Post('reset-password')
  public async resetPassword(@Body() { token, newPassword }: { token: string; newPassword: string }): Promise<void> {
    return this.authService.resetPassword(token, newPassword);
  }
}

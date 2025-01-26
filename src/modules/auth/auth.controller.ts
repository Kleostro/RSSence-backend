import { Request, Response } from 'express';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Body, Controller, Get, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleGuard } from './guards/google.guard';
import { JwtAccessGuard } from './guards/jwt-access.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    return this.authService.register(dto, res);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  public async login(
    @CurrentUser('id', ParseIntPipe) userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    return this.authService.generateTokens(userId, res);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  public async refreshToken(
    @CurrentUser('id', ParseIntPipe) userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    return this.authService.generateTokens(userId, res);
  }

  @UseGuards(JwtAccessGuard)
  @Post('logout')
  public logout(@Res({ passthrough: true }) res: Response): void {
    res.cookie('refreshToken', '');
  }

  @UseGuards(GoogleGuard)
  @Get('google')
  public google(): void {}

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  public async googleCallback(
    @Req() req: Request & { user: { _json: { email: string } } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    // eslint-disable-next-line no-underscore-dangle
    return this.authService.googleAuth(req.user._json.email, res);
  }

  @Post('change-password')
  public async changePassword(@Body() { email, changeLink }: { email: string; changeLink: string }): Promise<void> {
    return this.authService.changePassword(email, changeLink);
  }
}

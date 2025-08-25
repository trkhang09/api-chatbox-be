import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type LoginDto from './dtos/login.dto';
import { AuthService } from './auth.service';
import type RegisterDto from './dtos/register.dto';
import { Public } from './public.decorator';
import { AuthInterceptor } from './auth.interceptor';
import type ForgotPasswordDto from './dtos/forgot-password.dto';
import type ResetPasswordDto from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseInterceptors(AuthInterceptor)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req['user'];
  }

  @Public()
  @Post('forgot-password')
  async forgotPassaword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}

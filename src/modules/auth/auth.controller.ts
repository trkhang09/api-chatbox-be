import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type RegisterDto from './dtos/register.dto';
import { Public } from './public.decorator';
import { AuthInterceptor } from './auth.interceptor';
import { LoginDto } from './dtos/login.dto';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { MeDto } from './dtos/me.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseInterceptors(AuthInterceptor)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @ApiOkResponse({
    description: 'Returns the authenticated user',
    type: MeDto,
  })
  @Get('me')
  async me(@AuthUser() user) {
    return user;
  }

  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    type: Boolean,
  })
  @Public()
  @Post('forgot-password')
  async forgotPassaword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: Boolean,
  })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}

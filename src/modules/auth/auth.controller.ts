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
import { Public } from './public.decorator';
import { AuthInterceptor } from './auth.interceptor';
import { LoginDto } from './dtos/login.dto';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { MeDto } from './dtos/me.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCommonResponseCustom(LoginResponseDto)
  @Public()
  @UseInterceptors(AuthInterceptor)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @ApiCommonResponseCustom(MeDto)
  @Get('me')
  async me(@Req() req: Request) {
    return req['user'];
  }

  @ApiCommonResponseCustom(Boolean, true)
  @Public()
  @Post('forgot-password')
  async forgotPassaword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiCommonResponseCustom(Boolean, true)
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { AuthInterceptor } from './auth.interceptor';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { MeDto } from './dtos/me.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCommonResponseCustom(LoginResponseDto)
  @Public()
  @UseInterceptors(AuthInterceptor)
  @Post('login')
  @ApiOperation({ summary: 'Login into system' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @ApiCommonResponseCustom(MeDto)
  @ApiOperation({ summary: 'Get User data of this user' })
  @Get('me')
  async me(@Req() req: Request) {
    return req['user'];
  }

  @ApiCommonResponseCustom(Boolean, true)
  @ApiOperation({
    summary:
      'Request to the system to mark that this user forgot their password',
  })
  @Public()
  @Post('forgot-password')
  async forgotPassaword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiCommonResponseCustom(Boolean, true)
  @ApiOperation({ summary: 'Reset the password of this user' })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}

import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { AuthInterceptor } from './auth.interceptor';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
// import { LoginDto } from './dtos/login.dto';
// import { ForgotPasswordDto } from './dtos/forgot-password.dto';
// import { ResetPasswordDto } from './dtos/reset-password.dto';
// import { LoginResponseDto } from './dtos/login-response.dto';
// import { MeDto } from './dtos/me.dto';
// import { ChangePasswordDto } from './dtos/change-password.dto';

@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiTags('Authentication and Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}

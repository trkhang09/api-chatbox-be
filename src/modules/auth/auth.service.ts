import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import PayloadJwt from './jwt/jwt-payload';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { replacePlaceHolder } from 'src/common/utils';
import { newOtpTemplate } from 'src/common/utils/template';
import { UsersService } from '../users/users.service';
import { UserStatus } from 'src/common/enums/user-status.enum';
// import RegisterDto from './dtos/register.dto';
// import { LoginDto } from './dtos/login.dto';
// import { ForgotPasswordDto } from './dtos/forgot-password.dto';
// import { ResetPasswordDto } from './dtos/reset-password.dto';
// import { LoginResponseDto } from './dtos/login-response.dto';
// import { ChangePasswordDto } from './dtos/change-password.dto';
@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(User)
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}
}

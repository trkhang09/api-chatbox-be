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
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { replacePlaceHolder } from 'src/common/utils';
import { newOtpTemplate } from 'src/common/utils/template';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UsersService } from '../users/users.service';
@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(User)
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * service : login
   */

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const userFound = await this.usersRepository.findByEmailWithRole(
      loginDto.email,
    );

    if (!userFound) {
      throw new UnauthorizedException('email or passsword incorrect');
    }

    const isMatch = await bcrypt.compare(loginDto.password, userFound.password);

    if (!isMatch) {
      throw new UnauthorizedException('email or passsword incorrect');
    }

    // generate token
    const payload = {
      sub: userFound.id,
      email: userFound.email,
      fullname: userFound.fullname,
      roleId: userFound.role.id,
      roleName: userFound.role.name,
    } as PayloadJwt;

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      user: {
        email: userFound.email,
        fullname: userFound.fullname,
        userId: userFound.id,
        roleName: userFound.role.name,
        roleId: userFound.role.id,
      },
      tokens: {
        accessToken,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    // check email
    const userFound = await this.usersRepository.findByEmailWithRole(
      forgotPasswordDto.email,
    );

    if (!userFound) {
      throw new NotFoundException('account not exits');
    }

    // create otp and store otp
    const otpNew = await this.otpService.generate(userFound.id);

    const template = newOtpTemplate;
    const params = {
      code: otpNew.code,
      expiresMinutes: `${Math.floor(Number(process.env.OTP_EXPIRED_AT)) / (1000 * 60)} phút`,
    };
    const content = replacePlaceHolder(template.html, params);
    await this.emailService.sendEmail({
      subject: template.subject,
      text: content,
      to: forgotPasswordDto.email,
    });
    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const userFound = await this.usersRepository.findByEmailWithRole(
      resetPasswordDto.email,
    );

    if (!userFound) {
      throw new NotFoundException('try again');
    }

    const isVerifyOtp = await this.otpService.verify(
      userFound.id,
      resetPasswordDto.code,
    );

    if (!isVerifyOtp) {
      throw new NotFoundException('try again');
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      saltRounds,
    );

    userFound.password = hashPassword;

    await this.usersRepository.save(userFound);

    return true;
  }

  /**
   * change password
   * @param changePasswordDto
   * @param email
   * @returns
   */
  async changePassword(changePasswordDto: ChangePasswordDto, email: string) {
    const foundUser = await this.usersRepository.findPasswordByEmail(email);

    if (!foundUser) {
      throw new NotFoundException('user found found');
    }

    if (changePasswordDto.newPassword === changePasswordDto.oldPassword) {
      throw new BadRequestException(
        'new password cannot be the same as the old password.',
      );
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      foundUser.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('old passsword incorrect');
    }

    const hashPassword = await UsersService.generateHashPassword(
      changePasswordDto.newPassword,
    );

    foundUser.password = hashPassword;

    await this.usersRepository.save(foundUser);

    return true;
  }
}

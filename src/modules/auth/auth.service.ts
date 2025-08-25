import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import LoginDto from './dtos/login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import PayloadJwt from './jwt/jwt-payload';
import RegisterDto from './dtos/register.dto';
import { Role } from '../roles/entities/role.entity';
import ForgotPasswordDto from './dtos/forgot-password.dto';
import { OtpService } from '../otp/otp.service';
import { convertDateToMinute, replacePlaceHolder } from 'src/common/utils';
import { newOtpTemplate } from 'src/common/utils/template';
import { EmailService } from '../email/email.service';
import ResetPasswordDto from './dtos/reset-password.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * service : login
   */

  async login(loginDto: LoginDto) {
    const userFound = await this.usersRepository.findOne({
      where: {
        email: loginDto.email,
      },
    });

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
      role: userFound.role.code,
    } as PayloadJwt;

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      user: {
        email: userFound.email,
        fullname: userFound.fullname,
        userId: userFound.id,
        role: userFound.role.code,
      },
      tokens: {
        accessToken,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // const userFound = await this.usersRepository.findOne({
    //   where: {
    //     email: registerDto.email,
    //   },
    // });
    // if (userFound){
    //     throw new BadRequestException("account is exits, try login")
    // }
    // const saltRounds = Number(process.env.SALT_ROUNDS);
    // const hashPassword = await bcrypt.hash(registerDto.password,saltRounds);
    // const userStore = this.usersRepository.create({
    //     fullname:registerDto.fullname,
    //     email:registerDto.email,
    //     password:hashPassword,
    //     role:{
    //         // id:"ee331ef5-fa89-4fef-abd7-e2eac347d6fe"
    //         id:"aa7c1a64-1acf-442c-bab7-5dc56049f68e"
    //     }
    // });
    // await this.usersRepository.save(userStore);
    // return 1;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // check email
    const userFound = await this.usersRepository.findOne({
      where: {
        email: forgotPasswordDto.email,
      },
    });

    if (!userFound) {
      throw new NotFoundException('account not exits');
    }

    // create otp and store otp
    const otpNew = await this.otpService.generate(userFound.id);

    const template = newOtpTemplate;
    const params = {
      code: otpNew.code,
      expiresMinutes: `${otpNew.minutesLeft} phút`,
    };
    const content = replacePlaceHolder(template.html, params);
    await this.emailService.sendEmail({
      subject: template.subject,
      text: content,
      to: forgotPasswordDto.email,
    });
    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const userFound = await this.usersRepository.findOne({
      where: {
        email: resetPasswordDto.email,
      },
    });

    if (!userFound) {
      throw new ForbiddenException('try again');
    }

    const isVerifyOtp = await this.otpService.verify(
      userFound.id,
      resetPasswordDto.code,
    );

    if (!isVerifyOtp) {
      throw new ForbiddenException('try again');
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
}

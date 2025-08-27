import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { randomOtp } from 'src/common/utils';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
  ) {}

  async generate(userId: string): Promise<Otp> {
    const code = randomOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otp = this.otpRepo.create({
      user: {
        id: userId,
      },
      code,
      expiresAt,
    });

    return await this.otpRepo.save(otp);
  }

  async verify(userId: string, code: string): Promise<boolean> {
    const otp = await this.otpRepo.findOne({
      where: {
        user: {
          id: userId,
        },
        code,
        isUsed: false,
      },
    });

    if (!otp) throw new BadRequestException('OTP không hợp lệ');

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    return true;
  }
}

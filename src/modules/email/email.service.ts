import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import SendEmailDto from './dtos/send-email.dto';
import { text } from 'stream/consumers';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
  async sendEmail(sendEmailDto: SendEmailDto) {
    this.mailService.sendMail({
      from: `' ${process.env.EMAIL_FROM} '`,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      text: sendEmailDto.text,
      html: sendEmailDto.text,
    });
  }
}

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { text } from 'stream/consumers';
// import SendEmailDto from './dtos/send-email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
}

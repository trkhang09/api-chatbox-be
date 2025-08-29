import { Message } from '../entities/messages.entity';

export class RespondCreatedFirstMessageDto {
  chatTitle: string;
  message: Message;

  constructor(partial: Partial<RespondCreatedFirstMessageDto>) {
    Object.assign(this, partial);
  }
}

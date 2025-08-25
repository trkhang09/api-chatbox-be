import { IsDate, IsOptional, IsString } from 'class-validator';
import { Chat } from 'src/modules/chats/entities/chat.entity';

export class RespondMessageDto {
  @IsString()
  content: string;

  @IsString()
  createdByUserId: string;

  @IsDate()
  createdAt: Date;

  @IsOptional()
  chat?: Chat;

  constructor(partial: Partial<RespondMessageDto>) {
    Object.assign(this, partial);
  }
}

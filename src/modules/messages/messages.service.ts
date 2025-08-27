import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { RespondCreatedFirstMessageDto } from './dtos/respond-created-first-message.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class MessagesService {
  async createFirstMessage(
    message: string,
    creator: User,
  ): Promise<RespondCreatedFirstMessageDto> {
    throw new Error('Method not implemented.');
  }

  async removeAllMessagesFromChat(chat: Chat, entityManager: EntityManager) {
    throw new Error('Method not implemented.');
  }
}

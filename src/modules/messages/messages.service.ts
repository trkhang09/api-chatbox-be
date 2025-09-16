import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RespondCreatedFirstMessageDto } from './dtos/respond-created-first-message.dto';
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { Message } from './entities/messages.entity';
import { Chat } from '../chats/entities/chat.entity';
import { GeminiService } from '../gemini/gemini.service';
import { AiRespondWithoutLoginDto } from './dtos/ai-respond-without-login.dto';
import { ChatRepository } from '../chats/chat.repository';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { MessageRepository } from './message.repository';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { createMessageDto } from './dtos/create-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { plainToInstance } from 'class-transformer';
import { GetSearchedMessagesDto } from './dtos/get-searched-messages.dto';
import { ResponseSearchedMessagesDto } from './dtos/response-searched-messages.dto';

import { GetMessagesInChatCursorPaginationDto } from './dtos/get-message-in-chat-cursor-pagination.dto';
import { ResponseGetMessageInChatDto } from './dtos/response-get-messages-in-chat.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * to retrieve messages which have content matches with a specific keyword
   * @param chatId
   * @param query
   * @returns Promise<ResponseSearchedMessagesDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async searchMessagesInChat(
    chatId: string,
    query: GetSearchedMessagesDto,
  ): Promise<ResponseSearchedMessagesDto> {
    let foundChat: Chat;
    try {
      foundChat = await this.chatRepository.findChat(chatId);
    } catch (error) {
      throw error;
    }

    const where: FindOptionsWhere<Message> = {
      chat: { id: foundChat.id },
      content: ILike(`%${query.keyword ?? ''}%`),
    };

    let endedDate: Date;
    if (query.endedDate) {
      endedDate = new Date(query.endedDate);
      endedDate.setDate(endedDate.getDate() + 1);
    } else {
      endedDate = new Date();
    }

    if (query.startedDate) {
      const startedDate = new Date(query.startedDate);
      where.createdAt = Between(startedDate, endedDate);
    } else {
      where.createdAt = LessThan(endedDate);
    }

    if (query.senderId) {
      where.createdByUserId = query.senderId;
    }

    try {
      const foundMessages = await this.messageRepository.find({
        where,
        take: query.size,
        order: { updatedAt: { direction: 'DESC' } },
      });

      const responseMessages: Array<RespondMessageDto> = foundMessages.map(
        (message) => plainToInstance(RespondMessageDto, message),
      );

      const responseDto = new ResponseSearchedMessagesDto(responseMessages);

      return responseDto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot search messages in conversation with keyword = \`${query.keyword ?? ''}\`, ${error.message}`,
      );
    }
  }

  async createAiMessage(query: createMessageDto): Promise<Message> {
    try {
      return await this.messageRepository.save({
        content: query.content,
        chat: {
          id: query.chatId,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`failed to store Message`);
    }
  }

  async createAiMessageWithoutLogin(
    question: string,
  ): Promise<AiRespondWithoutLoginDto> {
    const aiResponse = await this.geminiService.generateResponse(question);

    const response = new AiRespondWithoutLoginDto(aiResponse);
    return response;
  }

  async createTempMessage(
    message: string,
    creatorId: string,
  ): Promise<RespondCreatedFirstMessageDto> {
    try {
      const title = await this.geminiService.generateSummary(message);

      const respondMessage = await this.messageRepository.save({
        content: message,
        createdByUserId: creatorId,
      });

      return new RespondCreatedFirstMessageDto({
        chatTitle: title.content,
        message: respondMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  async createMessage(
    query: createMessageDto,
    creatorId: string,
  ): Promise<RespondMessageDto> {
    const chat = await this.chatRepository.findChat(query.chatId);

    try {
      return await this.messageRepository.saveAndReturnDto({
        chat: chat,
        content: query.content,
        createdByUserId: creatorId,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to store message.');
    }
  }

  async editContentMessage(
    query: EditMessageDto,
    userId: string,
  ): Promise<RespondMessageDto> {
    try {
      await this.messageRepository.update(
        { id: query.id },
        {
          content: query.content,
          createdByUserId: userId,
        },
      );
      const editedMessage = await this.messageRepository.findOne({
        where: { id: query.id },
      });
      if (editedMessage) {
        return plainToInstance(RespondMessageDto, editedMessage);
      }
      throw new NotFoundException('Message not found');
    } catch (error) {
      throw error;
    }
  }

  async softRemoveMessage(id: string): Promise<RespondMessageDto> {
    return await this.messageRepository.softRemoveMessage(id);
  }

  async removeAllMessagesFromChat(
    chat: Chat,
    entityManager: EntityManager,
  ): Promise<boolean> {
    try {
      await entityManager
        .getRepository(Message)
        .softDelete({ chat: { id: chat.id } });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to remove messages for chat ${chat.id}: ${error.message}`,
      );
    }
  }

  async getUnreadMessagesInChat(chatId: string): Promise<RespondMessageDto[]> {
    return this.messageRepository.findUnreadMessagesInChat(chatId);
  }

  async readMessages(messageIds: string[]): Promise<RespondMessageDto[]> {
    if (!messageIds || messageIds.length === 0) {
      return [];
    }
    return await this.messageRepository.readMessages(messageIds);
  }

  async getMessagesWithCursorPagination(
    param: GetMessagesInChatCursorPaginationDto,
  ): Promise<ResponseGetMessageInChatDto> {
    return await this.messageRepository.findWithCursorPagination(param);
  }
}

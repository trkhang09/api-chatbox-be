import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RespondCreatedFirstMessageDto } from './dtos/respond-created-first-message.dto';
import { EntityManager, In } from 'typeorm';
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

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly geminiService: GeminiService,
  ) {}
  async getMessagesInChat(
    query: GetMessagesInChatDto,
  ): Promise<ResponsePaginateDto<RespondMessageDto>> {
    await this.chatRepository.findChat(query.chatId);

    try {
      const messages = await this.messageRepository.findWithPaginate(query);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  async createAiMessage(query: createMessageDto): Promise<Message> {
    const aiResponse = await this.geminiService.generateResponse(query.content);
    const chat = await this.chatRepository.findChat(query.chatId);

    try {
      return await this.messageRepository.save({
        content: aiResponse.content,
        chat: chat,
      });
    } catch (error) {
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

  async getUnreadMessageIdsInChat(
    chatId: string,
  ): Promise<RespondMessageDto[]> {
    return this.messageRepository.findUnreadMessagesInChat(chatId);
  }

  async readMessages(messageIds: string[]): Promise<RespondMessageDto[]> {
    if (!messageIds || messageIds.length === 0) {
      return [];
    }
    return await this.messageRepository.readMessages(messageIds);
  }
}

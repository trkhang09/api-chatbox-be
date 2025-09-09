import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { RespondCreatedFirstMessageDto } from './dtos/respond-created-first-message.dto';
import { EntityManager } from 'typeorm';
import { Message } from './entities/messages.entity';
import { InjectRepository } from '@nestjs/typeorm';
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
    //call API gemini in geminiService
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
    creator: User,
  ): Promise<RespondMessageDto> {
    const chat = await this.chatRepository.findChat(query.chatId);

    try {
      return await this.messageRepository.saveAndReturnDto({
        chat: chat,
        content: query.content,
        createdByUserId: creator.id,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to store message.');
    }
  }

  async editContentMessage(
    query: EditMessageDto,
    user: User,
  ): Promise<RespondMessageDto> {
    //validate user ownership of message
    const message = await this.validateMessageOwnership(query.id, user.id);
    message.content = query.content;
    try {
      const saved = await this.messageRepository.save(message);

      const response = new RespondMessageDto({
        content: saved.content,
        createdAt: saved.createdAt,
        createdByUserId: saved.createdByUserId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async softRemoveMessage(id: string, user: User): Promise<boolean> {
    try {
      // Verify user ownership of message
      await this.validateMessageOwnership(id, user.id);
      await this.messageRepository.softDelete(id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('fail to remove message');
    }
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

  private async validateMessageOwnership(
    messageId: string,
    userId: string,
  ): Promise<Message> {
    try {
      const message = await this.messageRepository.findOne({
        where: {
          id: messageId,
          createdByUserId: userId,
        },
      });
      if (!message) {
        throw new NotFoundException(
          `this User does not have permission to edit this message`,
        );
      }
      return message;
    } catch (error) {
      throw new InternalServerErrorException(
        'fail to validate Message Ownership!',
        error.message,
      );
    }
  }
}

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
import { AiResponseDto } from '../gemini/dto/ai-response.dto';
import { createMessageDto } from './dtos/create-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: MessageRepository,
    @InjectRepository(Chat)
    private readonly chatRepository: ChatRepository,
    private readonly geminiService: GeminiService,
  ) {}
  async getMessagesInChat(
    query: GetMessagesInChatDto,
  ): Promise<ResponsePaginateDto<Partial<Message>>> {
    const chat = await this.chatRepository.findOne({
      where: { id: query.chatId },
    });
    if (!chat)
      throw new Error(`Messages in Chat with id:${query.chatId} not found!`);
    try {
      const messages = await this.messageRepository.findWithPaginate(query);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  async createAiMessage(query: createMessageDto): Promise<Message> {
    let aiResponse: AiResponseDto;
    let chat: Chat | null;

    try {
      aiResponse = await this.geminiService.generateResponse(query.content);
    } catch (error) {
      throw error;
    }

    try {
      chat = await this.chatRepository.findOne({
        where: { id: query.chatId },
      });
    } catch (error) {
      throw new InternalServerErrorException(`can not get chat`);
    }
    if (!chat)
      throw new NotFoundException(
        `The Conversations with id ${query.chatId} does not exists`,
      );

    const message = this.messageRepository.create({
      content: aiResponse.content,
      chat: chat,
      isRead: false,
      createdAt: new Date(),
    });
    try {
      const saved = await this.messageRepository.save(message);
      return saved;
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
    creator: User,
  ): Promise<RespondCreatedFirstMessageDto> {
    try {
      const title = await this.geminiService.generateSummary(message);

      const respondMessage = this.messageRepository.create({
        content: message,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: creator.id,
        isRead: false,
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
  ): Promise<Message> {
    let chat: Chat | null;
    try {
      chat = await this.chatRepository.findOne({
        where: { id: query.chatId },
      });
    } catch (error) {
      throw new InternalServerErrorException(`can not get chat`);
    }

    if (!chat)
      throw new NotFoundException(
        `The Conversations with id ${query.chatId} does not exists.`,
      );

    try {
      const saved = await this.messageRepository.save({
        chat: chat,
        content: query.content,
        createdAt: new Date(),
        createdByUserId: creator.id,
        isRead: false,
      });
      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Failed to store message.');
    }
  }

  async editContentMessage(
    user: User,
    query: EditMessageDto,
  ): Promise<RespondMessageDto> {
    //find message to edit
    const message = await this.messageRepository.findOne({
      where: { id: query.id },
    });

    if (!message)
      throw new NotFoundException(
        `this Message with id:${query.id} not found!`,
      );

    if (!message.createdByUserId && message.createdByUserId !== user.id)
      throw new Error(
        `this User does not have permission to edit this message`,
      );
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

  async softRemoveMessage(id: string): Promise<boolean> {
    try {
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
}

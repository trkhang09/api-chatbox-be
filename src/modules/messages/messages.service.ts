import {
  BadRequestException,
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
  IsNull,
  LessThan,
  Not,
} from 'typeorm';
import { Message } from './entities/messages.entity';
import { Chat } from '../chats/entities/chat.entity';
import { GeminiService } from '../gemini/gemini.service';
import { AiRespondWithoutLoginDto } from './dtos/ai-respond-without-login.dto';
import { ChatRepository } from '../chats/chat.repository';
import { MessageRepository } from './message.repository';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { plainToInstance } from 'class-transformer';
import { GetSearchedMessagesDto } from './dtos/get-searched-messages.dto';
import { GetMessagesInChatCursorPaginationDto } from './dtos/get-message-in-chat-cursor-pagination.dto';
import { ResponseGetMessageInChatDto } from './dtos/response-get-messages-in-chat.dto';
import { GetMessagesAnalysisDto } from './dtos/get-messages-analysis.dto';
import { MessagesAnalysisType } from 'src/common/enums/messages-analysis-type.enum';
import { ResponseMessagesAnalysisDto } from './dtos/response-messages-analysis.dto';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';

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
  ): Promise<ResponsePaginateDto<RespondMessageDto>> {
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
      const [foundMessages, total] = await this.messageRepository.findAndCount({
        where,
        take: query.size,
        skip: (query.page - 1) * query.size,
        order: { updatedAt: { direction: 'DESC' } },
      });

      const data: Array<RespondMessageDto> = foundMessages.map((message) =>
        plainToInstance(RespondMessageDto, message),
      );

      const responseDto = new ResponsePaginateDto<RespondMessageDto>({
        data,
        total,
        size: query.size,
        page: query.page,
        totalInPage: data.length,
        totalPage: Math.ceil(total / query.size),
      });

      return responseDto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot search messages in conversation with keyword = \`${query.keyword ?? ''}\`, ${error.message}`,
      );
    }
  }

  async createAiMessage(
    query: CreateMessageDto,
    createdByUserId?: string,
  ): Promise<Message> {
    try {
      return await this.messageRepository.save({
        content: query.content,
        chat: {
          id: query.chatId,
        },
        createdByUserId,
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
      // const title = await this.geminiService.generateSummary(message);
      const title = 'default';

      const respondMessage = await this.messageRepository.save({
        content: message,
        createdByUserId: creatorId,
      });

      return new RespondCreatedFirstMessageDto({
        chatTitle: title,
        message: respondMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  async createMessage(
    query: CreateMessageDto,
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
    authUserDto: AuthUserDto,
  ): Promise<ResponseGetMessageInChatDto> {
    const chatFound = await this.chatRepository.findChatWithUser(
      param.chatId,
      authUserDto.sub,
    );

    await this.readMessagesByChatId(chatFound.id, chatFound.receiver?.id);
    return await this.messageRepository.findWithCursorPagination(param);
  }

  async readMessagesByChatId(chatId: string, createdByUserId?: string) {
    await this.messageRepository.update(
      {
        chat: {
          id: chatId,
        },
        createdByUserId,
      },
      {
        isRead: true,
      },
    );

    return true;
  }

  async getMessageByChatId(chatId: string): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.find({
        where: {
          chat: {
            id: chatId,
          },
        },
      });
      return messages;
    } catch (error) {
      throw new InternalServerErrorException(
        'fail to get Message in this chat',
        error.message,
      );
    }
  }

  async getAnalisisMessages(query: GetMessagesAnalysisDto) {
    const analysisKeys = Object.keys(MessagesAnalysisType);
    const period = analysisKeys
      .find((key) => MessagesAnalysisType[key] === query.time)
      ?.split('_')[0];

    let messages: Message[];
    try {
      messages = await this.messageRepository.find({
        where: { chat: Not(IsNull()) },
        select: { createdAt: true, chat: { type: true } },
        relations: ['chat'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Cannot get messages');
    }

    if (period === 'D') {
      const filterDays = analysisKeys
        .filter((key) => key.split('_')[0] === 'D')
        .map((key) => MessagesAnalysisType[key]);
      const filterDay = filterDays.indexOf(query.time);
      const hours = Array.from({ length: 24 }).map((_, hour) => hour);

      const response = hours.map(
        (hour) => new ResponseMessagesAnalysisDto(hour),
      );

      messages.forEach((message) => {
        if (message.createdAt.getUTCDay() === filterDay) {
          const createdHour = message.createdAt.getUTCHours();
          const createdHourIndex = hours.indexOf(createdHour);

          switch (message.chat.type) {
            case ChatTypes.BOT:
              response[createdHourIndex].aiMessagesCount++;
              break;
            case ChatTypes.USER:
              response[createdHourIndex].userMessagesCount++;
              break;
          }
        }
      });

      return response;
    } else if (period === 'M') {
      const filterMonths = analysisKeys
        .filter((key) => key.split('_')[0] === 'M')
        .map((key) => MessagesAnalysisType[key]);
      const filterMonth = filterMonths.indexOf(query.time);
      const days = Array.from({ length: 7 }).map((_, day) => day);

      const response = days.map(
        (hour) => new ResponseMessagesAnalysisDto(hour),
      );

      messages.forEach((message) => {
        if (message.createdAt.getUTCMonth() === filterMonth) {
          const createdDay = message.createdAt.getUTCDay();
          const createdDayIndex = days.indexOf(createdDay);

          switch (message.chat.type) {
            case ChatTypes.BOT:
              response[createdDayIndex].aiMessagesCount++;
              break;
            case ChatTypes.USER:
              response[createdDayIndex].userMessagesCount++;
              break;
          }
        }
      });

      return response;
    } else {
      throw new BadRequestException('Invalid analysis type');
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
  async findWithPaginate(
    query: GetMessagesInChatDto,
  ): Promise<ResponsePaginateDto<RespondMessageDto>> {
    let messages: Message[];
    let total: number;
    try {
      [messages, total] = await this.findAndCount({
        where: {
          chat: { id: query.chatId },
        },
        order: {
          createdAt: 'DESC',
        },
        withDeleted: true,
        skip: (query.page - 1) * query.size,
        take: query.size,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Can not get messages in Conversation, ',
        error.message,
      );
    }
    const respondMessages: RespondMessageDto[] = messages.map((message) =>
      plainToInstance(RespondMessageDto, message),
    );

    return new ResponsePaginateDto({
      data: respondMessages,
      page: query.page,
      size: query.size,
      total: total,
      totalInPage: respondMessages.length,
      totalPage: Math.ceil(total / query.size),
    });
  }

  async saveAndReturnDto(
    message: Partial<Message>,
  ): Promise<RespondMessageDto> {
    const saved = await super.save(message);
    const respond = plainToInstance(RespondMessageDto, saved);
    return respond;
  }

  /** find unread messages in a conversation
   * @param chatId
   * @returns Promise<String[]> an array of message ids
   */
  async findUnreadMessagesInChat(chatId: string): Promise<RespondMessageDto[]> {
    let messages: Message[];
    let total: number;
    try {
      [messages, total] = await this.findAndCount({
        where: {
          chat: { id: chatId },
          isRead: false,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Can not get messages in Conversation, ',
        error.message,
      );
    }
    return messages.map((message) =>
      plainToInstance(RespondMessageDto, message, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findMessages(messageIds: string[]): Promise<RespondMessageDto[]> {
    const messages = await this.find({
      where: {
        id: In(messageIds),
      },
    });
    const respondMessages = messages.map((message) =>
      plainToInstance(RespondMessageDto, message, {
        excludeExtraneousValues: true,
      }),
    );
    return respondMessages;
  }

  async findLatestMessageInChat(chatId: string): Promise<RespondMessageDto> {
    const message = await this.findOne({
      where: {
        chat: { id: chatId },
      },
      order: {
        createdAt: 'DESC',
      },
      withDeleted: true,
    });
    return plainToInstance(RespondMessageDto, message, {
      excludeExtraneousValues: true,
    });
  }

  async readMessages(ids: string[]): Promise<RespondMessageDto[]> {
    await this.update({ id: In(ids) }, { isRead: true });
    const messages = await this.findBy({ id: In(ids) });
    const respondMessages: RespondMessageDto[] = messages.map((message) => {
      return plainToInstance(RespondMessageDto, message, {
        excludeExtraneousValues: true,
      });
    });
    return respondMessages;
  }

  async softRemoveMessage(id: string): Promise<RespondMessageDto> {
    try {
      await this.softDelete(id);
      const message = await this.findOne({
        withDeleted: true,
        where: { id: id },
        order: { createdAt: 'DESC' },
      });
      if (!message)
        throw new InternalServerErrorException('failed to remove message');
      return plainToInstance(RespondMessageDto, message, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('fail to remove message');
    }
  }
}

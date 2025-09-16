import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { plainToInstance } from 'class-transformer';
import { GetMessagesInChatCursorPaginationDto } from './dtos/get-message-in-chat-cursor-pagination.dto';
import { ResponseGetMessageInChatDto } from './dtos/response-get-messages-in-chat.dto';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
  async findWithCursorPagination(
    param: GetMessagesInChatCursorPaginationDto,
  ): Promise<ResponseGetMessageInChatDto> {
    const chatId = param.chatId;

    const query = this.createQueryBuilder('messages')
      .where('messages.chat_id = :chatId', { chatId })
      .orderBy('messages.createdAt', 'DESC')
      .limit(param.size);

    if (param.cursor) {
      const cursor = new Date(param.cursor);
      query.andWhere('messages.createdAt < :cursor', { cursor });
    }

    try {
      const messages = await query.getMany();

      const nextCursor =
        messages.length > 0
          ? messages[messages.length - 1].createdAt
          : undefined;

      return {
        messages: plainToInstance(RespondMessageDto, messages, {
          excludeExtraneousValues: true,
        }),
        cursor: nextCursor,
      };
    } catch (error) {
      throw new InternalServerErrorException('fail to get messages');
    }
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
   * @returns Promise<RespondMessageDto[]> an array of message
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
        select: [
          'id',
          'content',
          'createdByUserId',
          'createdAt',
          'isRead',
          'updatedAt',
          'deletedAt',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Can not get messages in Conversation, ',
        error.message,
      );
    }
    return plainToInstance(RespondMessageDto, messages, {
      excludeExtraneousValues: true,
    });
  }

  async findMessages(messageIds: string[]): Promise<RespondMessageDto[]> {
    const messages = await this.find({
      where: {
        id: In(messageIds),
      },
    });
    return plainToInstance(RespondMessageDto, messages, {
      excludeExtraneousValues: true,
    });
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
      select: [
        'id',
        'content',
        'createdByUserId',
        'createdAt',
        'isRead',
        'updatedAt',
        'deletedAt',
      ],
    });
    return plainToInstance(RespondMessageDto, message, {
      excludeExtraneousValues: true,
    });
  }

  async readMessages(ids: string[]): Promise<RespondMessageDto[]> {
    await this.update({ id: In(ids) }, { isRead: true });
    const messages = await this.find({
      where: { id: In(ids) },
      select: [
        'id',
        'content',
        'createdByUserId',
        'createdAt',
        'isRead',
        'updatedAt',
        'deletedAt',
      ],
    });
    return plainToInstance(RespondMessageDto, messages, {
      excludeExtraneousValues: true,
    });
  }

  async softRemoveMessage(id: string): Promise<RespondMessageDto> {
    try {
      await this.softDelete(id);
      const message = await this.findOne({
        withDeleted: true,
        where: { id: id },
        order: { createdAt: 'DESC' },
        select: [
          'id',
          'content',
          'createdByUserId',
          'createdAt',
          'isRead',
          'updatedAt',
          'deletedAt',
        ],
      });
      if (!message) {
        throw new InternalServerErrorException('failed to remove message');
      }
      return plainToInstance(RespondMessageDto, message, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('fail to remove message');
    }
  }
}

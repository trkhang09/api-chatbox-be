import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { plainToInstance } from 'class-transformer';
import { GetMessagesInChatCursorPaginationDto } from './dtos/get-message-in-chat-cursor-pagination.dto';
import { ResponseGetMessageInChatDto } from './dtos/response-get-messages-in-chat.dto';
import { DirectionConstants } from 'src/common/constants/direction.constants';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
  async findWithCursorPagination(
    param: GetMessagesInChatCursorPaginationDto,
  ): Promise<ResponseGetMessageInChatDto> {
    const { chatId, size, cursor, direction } = param;
    let cursorDate: Date | undefined;
    if (cursor) {
      cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) {
        throw new BadRequestException('Invalid cursor timestamp');
      }
    }
    const baseQuery = (alias = 'm') =>
      this.createQueryBuilder(alias)
        .where(`${alias}.chat_id = :chatId`, { chatId })
        .withDeleted();

    if (direction == DirectionConstants.BOTH) {
      if (!cursorDate) {
        throw new BadRequestException(
          "cursor timestamp is require  for direction='both'.",
        );
      }
      const beforeMsgs = await baseQuery('m')
        .andWhere('m.createdAt <= :cursorDate', { cursorDate })
        .orderBy('m.createdAt', 'DESC')
        .take(size)
        .getMany();

      const afterMsgs = await baseQuery('m')
        .andWhere('m.createdAt > :cursorDate', { cursorDate })
        .orderBy('m.createdAt', 'ASC')
        .take(size)
        .getMany();

      const messages = [...afterMsgs.reverse(), ...beforeMsgs];

      return {
        messages: plainToInstance(RespondMessageDto, messages, {
          excludeExtraneousValues: true,
        }),
        cursors:
          messages.length > 0
            ? {
                first: messages[0].createdAt.toISOString(),
                last: messages[messages.length - 1].createdAt.toISOString(),
              }
            : undefined,
      } as ResponseGetMessageInChatDto;
    }

    const query = baseQuery('messages').take(size);

    if (cursorDate) {
      if (direction === DirectionConstants.NEXT) {
        query.andWhere('messages.createdAt > :cursor', { cursor: cursor });
      } else if (direction === DirectionConstants.PREV) {
        query.andWhere('messages.createdAt <= :cursor', { cursor: cursor });
      }
    }

    if (direction === DirectionConstants.NEXT) {
      query.orderBy('messages.createdAt', 'ASC');
    } else if (direction === DirectionConstants.PREV) {
      query.orderBy('messages.createdAt', 'DESC');
    } else {
      query.orderBy('messages.createdAt', 'DESC');
    }

    try {
      let messages = await query.getMany();

      if (param.direction === DirectionConstants.NEXT) {
        messages = messages.reverse();
      }

      const cursors =
        messages.length > 0
          ? {
              first: messages[0].createdAt.toISOString(),
              last: messages[messages.length - 1].createdAt.toISOString(),
            }
          : undefined;

      return {
        messages: plainToInstance(RespondMessageDto, messages, {
          excludeExtraneousValues: true,
        }),
        cursors: cursors,
      } as ResponseGetMessageInChatDto;
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

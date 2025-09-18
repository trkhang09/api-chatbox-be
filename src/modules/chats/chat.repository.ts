import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../users/dtos/user.dto';
import { RespondChatDto } from './dtos/respond-chat.dto';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { MessageRepository } from '../messages/message.repository';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(
    private readonly messageRepository: MessageRepository,
    private dataSource: DataSource,
  ) {
    super(Chat, dataSource.createEntityManager());
  }

  async findChatByTitleWithPaginate(
    userId: string,
    query: GetBatchedChatDto,
  ): Promise<ResponsePaginateDto<RespondChatDto>> {
    let conversations: Chat[];
    let total: number;
    try {
      [conversations, total] = await this.createQueryBuilder('chat')
        .leftJoinAndSelect(
          'chat.users',
          'users',
          query.type === ChatTypes.USER ? 'users.id != :userId' : '',
          { userId },
        )
        .leftJoin('chat.messages', 'messages')
        .where((qb) => {
          qb.where(
            'EXISTS (SELECT 1 FROM chat_participants cp WHERE cp."chat_id" = chat.id AND cp."user_id" = :userId)',
            { userId },
          );
        })
        .andWhere('chat.type = :type', { type: query.type })
        .andWhere('chat.title ILIKE :title', {
          title: `%${query.searchKeyword || ''}%`,
        })
        .addSelect('MAX(messages.created_at)', 'last_message_at')
        .groupBy('chat.id')
        .addGroupBy('users.id')
        .orderBy('last_message_at', 'DESC')
        .skip((query.page - 1) * query.size)
        .take(query.size)
        .getManyAndCount();
    } catch (error) {
      throw new InternalServerErrorException('can not get conversations');
    }

    const partialConversations: RespondChatDto[] = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage =
          await this.messageRepository.findLatestMessageInChat(conversation.id);
        return {
          id: conversation.id,
          title: conversation.title,
          type: conversation.type,
          createdAt: conversation.createdAt,
          createdByUserId: conversation.createdByUserId,
          lastMessage: lastMessage,
          receiver: plainToInstance(UserDto, conversation.users[0], {
            excludeExtraneousValues: true,
          }),
        };
      }),
    );

    return new ResponsePaginateDto({
      data: partialConversations,
      page: query.page,
      size: query.size,
      total: total,
      totalInPage: partialConversations.length,
      totalPage: Math.ceil(total / query.size),
    });
  }

  async findChat(id: string): Promise<Chat> {
    try {
      const chat = await this.findOne({
        where: { id },
      });
      if (!chat)
        throw new NotFoundException(
          `The Conversations with id ${id} does not exists`,
        );
      return chat;
    } catch (error) {
      throw new InternalServerErrorException(`can not get chat`);
    }
  }

  async findChatWithUser(id: string, userId: string): Promise<RespondChatDto> {
    try {
      const chat = await this.createQueryBuilder('chat')
        .leftJoinAndSelect('chat.users', 'users', 'users.id != :userId')
        .where(
          'EXISTS (SELECT 1 FROM chat_participants cp WHERE cp."chat_id" = chat.id AND cp."user_id" = :userId)',
          { userId },
        )
        .andWhere('chat.id = :id', { id })
        .getOne();
      if (!chat) {
        throw new NotFoundException(
          `The Conversations with id ${id} does not exists`,
        );
      }
      return new RespondChatDto({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        type: chat.type,
        receiver: plainToInstance(UserDto, chat.users[0], {
          excludeExtraneousValues: true,
        }),
      });
    } catch (error) {
      throw new InternalServerErrorException(`can not get chat`);
    }
  }
}

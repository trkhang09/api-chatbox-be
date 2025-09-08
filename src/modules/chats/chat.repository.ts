import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../users/dtos/user.dto';
import { RespondChatDto } from './dtos/respond-chat.dto';
import { ChatTypes } from 'src/common/enums/chat-type.enum';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(private dataSource: DataSource) {
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
        .skip((query.page - 1) * query.size)
        .take(query.size)
        .getManyAndCount();
    } catch (error) {
      throw new InternalServerErrorException('can not get conversations');
    }
    const partialConversations: RespondChatDto[] = conversations.map(
      (conversation) => {
        return {
          id: conversation.id,
          title: conversation.title,
          type: conversation.type,
          createdAt: conversation.createdAt,
          createdByUserId: conversation.createdByUserId,
          user: plainToInstance(UserDto, conversation.users[0], {
            excludeExtraneousValues: true,
          }),
        };
      },
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
}

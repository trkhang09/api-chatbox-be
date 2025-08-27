import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { RespondBatchedChatsDto } from './dtos/respond-batched-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { RespondRemovedChatHistoryDto } from './dtos/respond-removed-chat-history.dto';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(private dataSource: DataSource) {
    super(Chat, dataSource.createEntityManager());
  }

  async findChatByTitleWithPaginate(
    userId: string,
    type: ChatTypes,
    page: number,
    size: number,
    searchKeyword?: string,
  ): Promise<ResponsePaginateDto<Partial<Chat>>> {
    let conversations: Chat[];
    let total: number;
    try {
      [conversations, total] = await this.findAndCount({
        relations: ['users'],
        where: {
          type: type,
          users: { id: userId },
          title: Like(`%${searchKeyword ? searchKeyword : ''}%`),
        },
        skip: (page - 1) * size,
        take: size,
      });
    } catch (error) {
      throw new InternalServerErrorException('can not get conversations');
    }
    const partialConversations: Partial<Chat>[] = conversations.map(
      (conversation) => ({
        id: conversation.id,
        title: conversation.title,
        type: conversation.type,
        createdAt: conversation.createdAt,
        createdByUserId: conversation.createdByUserId,
      }),
    );

    return new ResponsePaginateDto({
      data: partialConversations,
      page: page,
      size: size,
      total: total,
      totalInPage: partialConversations.length,
      totalPage: Math.ceil(total / size),
    });
  }
}

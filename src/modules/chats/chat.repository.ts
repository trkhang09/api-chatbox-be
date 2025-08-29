import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { RespondBatchedChatsDto } from './dtos/respond-batched-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { RespondRemovedChatHistoryDto } from './dtos/respond-removed-chat-history.dto';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(private dataSource: DataSource) {
    super(Chat, dataSource.createEntityManager());
  }

  async findChatByTitleWithPaginate(
    userId: string,
    query: GetBatchedChatDto,
  ): Promise<ResponsePaginateDto<Partial<Chat>>> {
    let conversations: Chat[];
    let total: number;
    try {
      [conversations, total] = await this.findAndCount({
        relations: ['users'],
        where: {
          type: query.type,
          users: { id: userId },
          title: Like(`%${query.searchKeyword ? query.searchKeyword : ''}%`),
        },
        skip: (query.page - 1) * query.size,
        take: query.size,
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

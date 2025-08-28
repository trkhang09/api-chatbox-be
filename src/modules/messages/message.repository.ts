import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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

  async saveAndReturnDto(message: Message): Promise<RespondMessageDto> {
    const saved = await super.save(message);
    const respond = plainToInstance(RespondMessageDto, saved, {
      excludeExtraneousValues: true,
    });
    return respond;
  }
}

import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { DataSource, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { Message } from '../messages/entities/messages.entity';
import { RespondCreatedNewChatDto } from './dtos/respond-created-new-chat.dto';
import { User } from '../users/entities/user.entity';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { RespondChangedChatTitleDto } from './dtos/respond-changed-chat-title.dto';
import { MessagesService } from '../messages/messages.service';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ChatRepository } from './chat.repository';
import { CreateNewChatDto } from './dtos/create-new-chat.dto';
import { ChangeChatTitleDto } from './dtos/change-chat-title.dto';
import type { AiService } from '../ai/ai.service';
import { Observable } from 'rxjs';
import { RespondChatDto } from './dtos/respond-chat.dto';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
import { plainToInstance } from 'class-transformer';
import { createDashboardRequestDto } from 'src/common/utils/create-dashboard-request-dto';
import { validateDashboardRequest } from 'src/common/utils/validate-dashboard-request';
import { ChatGenerateAiDto } from './dtos/chat-generate-ai.dto';
import { isNumber } from 'class-validator';
import { RespondLatestChatDto } from './dtos/respond-latest-chat.dto';
import { UserDto } from '../users/dtos/user.dto';
import { UsersRepository } from '../users/users.repository';
import { SettingConstants } from 'src/common/constants/setting-constrants';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import {
  ChatboxSseEvent,
  ChatboxSseMessageType,
} from 'src/common/constants/chatbox-sse';
import { SseDeltaDto, SseMessageDto } from './dtos/sse.dto';

export const DashboardForConversationRequestDto =
  createDashboardRequestDto(ChatTypes);

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UsersRepository,
    private readonly dataSource: DataSource,
    private readonly messagesService: MessagesService,
    private readonly settingService: SettingsService,
    private readonly userService: UsersService,
    @Inject('AI_SERVICE') private readonly aiService: AiService,
  ) {}

  /**
   * get quantity with a specific status/type within a number of days
   */
  async getQuantity(
    query: InstanceType<typeof DashboardForConversationRequestDto>,
  ) {
    try {
      const payload = validateDashboardRequest(query, ChatTypes);
      let where: any = {};
      where.status = payload.status;

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - payload.days);
      where.createdAt = MoreThanOrEqual(fromDate);

      const quantity = await this.chatRepository.count({ where });
      return quantity;
    } catch (error) {
      throw new Error('Failed to get quantity: ' + error.message);
    }
  }

  /**
   * get list of latest conversations with or without status within a specific number of days
   * @param query
   * @returns Promise<Array<RespondLatestChatDto>>
   * @throws BadRequestException
   * @throws InternalServerErrorException
   */
  async getLatestConversations(
    query: InstanceType<typeof DashboardForConversationRequestDto>,
  ): Promise<Array<RespondLatestChatDto>> {
    let payload: {
      status: number;
      days: number;
    };
    try {
      payload = validateDashboardRequest(query, ChatTypes, true);
    } catch (error) {
      throw error;
    }

    let where: FindOptionsWhere<Chat> = {};

    const statuses = Object.values(ChatTypes).filter((v) => isNumber(v));
    if (statuses.includes(payload.status)) {
      where.type = payload.status;
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - payload.days);
    where.createdAt = MoreThanOrEqual(fromDate);

    let foundConversations: Chat[];
    try {
      foundConversations = await this.chatRepository.find({
        where,
        relations: ['users', 'messages'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot get latest conversations, ${error.message}`,
      );
    }

    const responseList: RespondLatestChatDto[] = [];

    foundConversations.forEach((doc) => {
      const dto = new RespondLatestChatDto();

      Object.keys(dto).forEach((k) => {
        dto[k] = doc[k];
      });

      dto.participants = [];
      doc.users.forEach((user) => {
        const participantDto = new UserDto({});

        Object.keys(participantDto).forEach((k) => {
          participantDto[k] = user[k];
        });

        participantDto.role = undefined;

        dto.participants.push(participantDto);
      });

      dto.messagesCount = doc.messages.length;

      responseList.push(dto);
    });

    return responseList;
  }

  /**
   * Find a list of 1 conversations based on a keyword or get all if no keyword is found.
   * @param query.page
   * @param query.size
   * @param query.type
   * @param query.searchKeyword is optional
   * @param user
   * @returns Promise<ResponsePaginateDto<Partial<Chat>>>
   * @throws InternalServerErrorException
   */
  async getChatBatch(
    query: GetBatchedChatDto,
    userId: string,
  ): Promise<ResponsePaginateDto<RespondChatDto>> {
    try {
      const response = await this.chatRepository.findChatByTitleWithPaginate(
        userId,
        query,
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new chat with the given message.
   * @param message
   * @param creator
   * @param receiver
   * @returns Promise<RespondCreatedNewChatDto>
   * @throws InternalServerErrorException
   */
  async createNewChatWithMessage(
    body: CreateNewChatDto,
    creator: AuthUserDto,
  ): Promise<RespondCreatedNewChatDto> {
    const receiver = await this.userRepository.findOneBy({
      id: body.receiverId,
    });
    let newMsg: Message;
    let title: string;

    try {
      const result = await this.messagesService.createTempMessage(
        body.message,
        creator.sub,
      );
      newMsg = result.message;
      title = result.chatTitle;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create the first message for the new chat. ' + error.message,
      );
    }

    let createdChat: Chat;
    const participants: User[] = [];
    let type: ChatTypes = ChatTypes.BOT;

    let foundCreator: User | null;
    try {
      foundCreator = await this.userRepository.findOne({
        where: { id: creator.sub },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot found creator with id = \`${creator.sub}\`, ${error.message}`,
      );
    }

    if (!foundCreator) {
      throw new NotFoundException(
        `Cannot found creator with id = \`${creator.sub}\``,
      );
    }

    participants.push(foundCreator);

    if (body.receiverId) {
      let receiver: User | null;
      try {
        receiver = await this.userRepository.findOne({
          where: { id: body.receiverId },
        });
      } catch (error) {
        throw new InternalServerErrorException(
          `Cannot found creator with id = \`${body.receiverId}\`, ${error.message}`,
        );
      }

      if (!receiver) {
        throw new NotFoundException(
          `Cannot found creator with id = \`${body.receiverId}\``,
        );
      }

      participants.push(receiver);
      type = ChatTypes.USER;
    }

    try {
      createdChat = this.chatRepository.create({
        title,
        type,
        messages: [newMsg],
        users: participants,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create new chat entity. ' + error.message,
      );
    }

    let savedChat: Chat;
    try {
      savedChat = await this.chatRepository.save(createdChat);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save new chat entity. ' + error.message,
      );
    }
    const receiverDto = plainToInstance(UserDto, receiver, {
      excludeExtraneousValues: true,
    });

    const chatDto = new RespondCreatedNewChatDto({
      id: savedChat.id,
      title: savedChat.title,
      type: savedChat.type,
      messages: savedChat.messages,
      createdAt: savedChat.createdAt,
      receiver: receiverDto,
    });
    return chatDto;
  }

  /**
   * Rename an existing chat.
   * @param id
   * @param newTitle
   * @returns Promise<RespondChangedChatTitleDto>
   * @throws InternalServerErrorException
   */
  async changeChatTitle(
    body: ChangeChatTitleDto,
  ): Promise<RespondChangedChatTitleDto> {
    let foundChat: Chat | null;
    try {
      foundChat = await this.chatRepository.findOne({
        where: { id: body.id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find chat. ' + error.message,
      );
    }

    if (!foundChat) {
      throw new NotFoundException('Chat not found');
    }

    if (foundChat.type === ChatTypes.USER) {
      throw new BadRequestException('Cannot change title of user-to-user chat');
    }

    foundChat.title = body.title.trim();

    let savedChat: Chat;
    try {
      savedChat = await this.chatRepository.save(foundChat);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save renamed chat. ' + error.message,
      );
    }

    const respondChangedChatTitleDto = new RespondChangedChatTitleDto({
      id: savedChat.id,
      newTitle: savedChat.title,
      updatedAt: savedChat.updatedAt,
    });
    return respondChangedChatTitleDto;
  }

  /**
   * Remove chat history for a specific chat.
   * @param id
   * @returns Promise<RespondRemovedChatHistoryDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async removeChatHistory(id: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const foundChat = await this.chatRepository.findOne({
        where: { id: id },
      });
      if (!foundChat) throw new NotFoundException('Failed to find chat.');

      await this.messagesService.removeAllMessagesFromChat(
        foundChat,
        queryRunner.manager,
      );

      await queryRunner.manager.softDelete('chats', { id: foundChat.id });

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async *generate(
    chatGenerateAiDto: ChatGenerateAiDto,
    user: AuthUserDto,
  ): AsyncGenerator<{ event: string; data: SseDeltaDto | SseMessageDto }> {
    if (!user) {
      for await (const chunk of this.aiService.generateStreamResponseNoLogin(
        chatGenerateAiDto.question,
      )) {
        yield {
          event: ChatboxSseEvent.DELTA,
          data: { chatId: null, content: chunk },
        };
      }
      return;
    }

    let chat: Chat | null;
    if (chatGenerateAiDto.chatId) {
      chat = await this.chatRepository.findOne({
        where: { id: chatGenerateAiDto.chatId },
      });
      if (!chat) throw new NotFoundException('Chat not found');
    } else {
      chat = await this.chatRepository.save({
        title: chatGenerateAiDto.question.slice(0, 50),
        type: ChatTypes.BOT,
        createdByUserId: user.sub,
        users: [{ id: user.sub }],
      });

      yield {
        event: ChatboxSseEvent.MESSAGE,
        data: { chatId: chat.id, type: ChatboxSseMessageType.CHAT_CREATED },
      };
    }

    let chunksString = '';
    let isAllowExternal = (await this.settingService.getValueByKey(
      SettingConstants.ALLOW_EXTERNAL_INFO,
    )) as boolean;
    const maxTokens = (await this.settingService.getValueByKey(
      SettingConstants.MAX_TOKENS,
    )) as number;
    const countTokensUsed = await this.userService.getCountTokensUsed(user.sub);
    isAllowExternal = isAllowExternal && countTokensUsed < maxTokens;

    for await (const chunk of this.aiService.generateStreamResponse(
      chatGenerateAiDto.question,
      isAllowExternal,
      user.sub,
    )) {
      chunksString += chunk;
      yield {
        event: ChatboxSseEvent.DELTA,
        data: { chatId: chat.id, content: chunk },
      };
    }

    yield {
      event: ChatboxSseEvent.MESSAGE,
      data: { chatId: chat.id, type: ChatboxSseMessageType.COMPLETE },
    };

    await this.messagesService.createAiMessage(
      {
        chatId: chat.id,
        content: chatGenerateAiDto.question,
      },
      user.sub,
    );

    await this.messagesService.createAiMessage({
      chatId: chat.id,
      content: chunksString,
    });
  }

  async findChatById(id: string, userId: string): Promise<RespondChatDto> {
    return await this.chatRepository.findChatWithUser(id, userId);
  }
}

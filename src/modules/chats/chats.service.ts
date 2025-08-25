import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { Message } from '../messages/entities/messages.entity';
import { RespondCreatedNewChatDto } from './dtos/respond-created-new-chat.dto';
import { User } from '../users/entities/user.entity';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { RespondBatchedChatsDto } from './dtos/respond-batched-chat.dto';
import { RespondChatDto } from './dtos/respond-chat.dto';
import { RespondChangedChatTitleDto } from './dtos/respond-changed-chat-title.dtoå';
import { RespondRemovedChatHistoryDto } from './dtos/respond-removed-chat-history.dto';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    private readonly messagesService: MessagesService,
  ) {}

  /**
   * Get a batch of chat history.
   * @param batch count from 1
   * @param limit
   * @param user
   * @returns Promise<RespondBatchedChatsDto>
   * @throws InternalServerErrorException
   */
  async getChatBatch(
    batch: number,
    limit: number,
    type: ChatTypes,
    user: User,
  ): Promise<RespondBatchedChatsDto> {
    let chats: Chat[];
    let total: number;

    try {
      [chats, total] = await this.chatsRepository.findAndCount({
        relations: ['users'],
        where: {
          type,
          users: {
            id: user.id,
          },
          deletedAt: IsNull(),
        },
        skip: (batch - 1) * limit,
        take: limit,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find chats with title. ' + error.message,
      );
    }

    const getChatBatchDto = new RespondBatchedChatsDto();
    getChatBatchDto.batch = batch;
    getChatBatchDto.limit = limit;
    getChatBatchDto.chats = chats.map((chat) => {
      const chatDto = new RespondChatDto();
      chatDto.id = chat.id;
      chatDto.title = chat.title;
      chatDto.type = chat.type;
      chatDto.createdAt = chat.createdAt;

      return chatDto;
    });
    getChatBatchDto.totalInBatch = chats.length;
    getChatBatchDto.totalChats = total;
    return getChatBatchDto;
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
    message: string,
    creator: User,
    receiver?: User,
  ): Promise<RespondCreatedNewChatDto> {
    let newMsg: Message;
    let title: string;

    try {
      const result = await this.messagesService.createFirstMessage(
        message,
        creator,
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

    participants.push(creator);

    if (receiver) {
      participants.push(receiver);
      type = ChatTypes.USER;
    }

    try {
      createdChat = this.chatsRepository.create({
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
      savedChat = await this.chatsRepository.save(createdChat);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save new chat entity. ' + error.message,
      );
    }

    const chatDto = new RespondCreatedNewChatDto();
    chatDto.id = savedChat.id;
    chatDto.title = savedChat.title;
    chatDto.type = savedChat.type;
    chatDto.messages = savedChat.messages;
    chatDto.createdAt = savedChat.createdAt;
    return chatDto;
  }

  /**
   * Rename an existing chat.
   * @param id
   * @param newTitle
   * @returns Promise<RespondChangedChatTitleDto>
   * @throws InternalServerErrorException
   * @throws NotFoundException Chat not found.
   * @throws BadRequestException Title cannot be empty.
   */
  async changeChatTitle(
    id: string,
    newTitle: string,
  ): Promise<RespondChangedChatTitleDto> {
    let foundChat: Chat | null;
    try {
      foundChat = await this.chatsRepository.findOne({
        where: { id },
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

    const oldTitle = foundChat.title;
    newTitle = newTitle.trim();

    if (newTitle.length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    if (newTitle === foundChat.title) {
      throw new BadRequestException('Title has nothing changes');
    }

    foundChat.title = newTitle;

    let savedChat: Chat;
    try {
      savedChat = await this.chatsRepository.save(foundChat);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save renamed chat. ' + error.message,
      );
    }

    const respondChangedChatTitleDto = new RespondChangedChatTitleDto();
    respondChangedChatTitleDto.id = foundChat.id;
    respondChangedChatTitleDto.oldTitle = oldTitle;
    respondChangedChatTitleDto.newTitle = savedChat.title;
    respondChangedChatTitleDto.updatedAt = savedChat.updatedAt;
    return respondChangedChatTitleDto;
  }

  /**
   * Remove chat history for a specific chat.
   * @param id
   * @returns Promise<RespondRemovedChatHistoryDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async removeChatHistory(id: string): Promise<RespondRemovedChatHistoryDto> {
    let foundChat: Chat | null;
    try {
      foundChat = await this.chatsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find chat. ' + error.message,
      );
    }

    if (!foundChat) {
      throw new NotFoundException('Chat not found');
    }

    try {
      await this.messagesService.removeAllMessagesFromChat(foundChat);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    foundChat.deletedAt = new Date();

    let savedChat: Chat;
    try {
      savedChat = await this.chatsRepository.save(foundChat);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save chat after removing history. ' + error.message,
      );
    }
    const respondremovedChatHistoryDto = new RespondRemovedChatHistoryDto();
    respondremovedChatHistoryDto.id = savedChat.id;
    respondremovedChatHistoryDto.title = savedChat.title;
    respondremovedChatHistoryDto.removedAt =
      savedChat.deletedAt ?? foundChat.deletedAt;
    return respondremovedChatHistoryDto;
  }

  /**
   * Search for chats by title.
   * @param query The search query.
   * @returns Promise<RespondChatDto[]> A list of chats that match the search query.
   * @throws InternalServerErrorException
   */
  async searchChatsByTitle(
    query: string,
    limit: number,
  ): Promise<RespondChatDto[]> {
    let foundChats: Chat[];
    try {
      foundChats = await this.chatsRepository.find({
        where: { title: Like(`%${query}%`), type: ChatTypes.BOT },
        take: limit,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to search chats by title. ' + error.message,
      );
    }

    const dto: RespondChatDto[] = [];

    foundChats.forEach((chat) => {
      const chatDto = new RespondChatDto();
      chatDto.id = chat.id;
      chatDto.title = chat.title;
      chatDto.createdAt = chat.createdAt;
      chatDto.type = chat.type;
      dto.push(chatDto);
    });

    return dto;
  }
}

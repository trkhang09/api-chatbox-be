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
import { RespondChangedChatTitleDto } from './dtos/respond-changed-chat-title.dto';
import { RespondRemovedChatHistoryDto } from './dtos/respond-removed-chat-history.dto';
import { MessagesService } from '../messages/messages.service';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: ChatRepository,
    private readonly messagesService: MessagesService,
  ) {}

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
    user: User,
  ): Promise<ResponsePaginateDto<Partial<Chat>>> {
    try {
      const response = await this.chatRepository.findChatByTitleWithPaginate(
        user.id,
        query.type,
        query.page,
        query.size,
        query.searchKeyword,
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
      foundChat = await this.chatRepository.findOne({
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

    foundChat.title = newTitle;

    let savedChat: Chat;
    try {
      savedChat = await this.chatRepository.save(foundChat);
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
      foundChat = await this.chatRepository.findOne({
        where: { id: id },
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

    await this.chatRepository.softDelete(foundChat);

    const respondremovedChatHistoryDto = new RespondRemovedChatHistoryDto({
      id: foundChat.id,
      title: foundChat.title,
    });
    return respondremovedChatHistoryDto;
  }
}

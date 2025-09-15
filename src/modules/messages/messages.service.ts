import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RespondCreatedFirstMessageDto } from './dtos/respond-created-first-message.dto';
import { EntityManager, ILike, In } from 'typeorm';
import { Message } from './entities/messages.entity';
import { Chat } from '../chats/entities/chat.entity';
import { GeminiService } from '../gemini/gemini.service';
import { AiRespondWithoutLoginDto } from './dtos/ai-respond-without-login.dto';
import { ChatRepository } from '../chats/chat.repository';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { MessageRepository } from './message.repository';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { createMessageDto } from './dtos/create-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { plainToInstance } from 'class-transformer';
import { GetSearchedMessagesDto } from './dtos/get-searched-messages.dto';
import { ResponseSearchedMessagesDto } from './dtos/response-searched-messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly geminiService: GeminiService,
  ) {}
  async getMessagesInChat(
    query: GetMessagesInChatDto,
  ): Promise<ResponsePaginateDto<RespondMessageDto>> {
    await this.chatRepository.findChat(query.chatId);

    try {
      const messages = await this.messageRepository.findWithPaginate(query);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  /**
   * to retrieve messages which have content matches with a specific keyword
   * @param chatId
   * @param query
   * @returns Promise<ResponseSearchedMessagesDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async searchMessagesInChat(
    chatId: string,
    query: GetSearchedMessagesDto,
  ): Promise<ResponseSearchedMessagesDto> {
    let foundChat: Chat;
    try {
      foundChat = await this.chatRepository.findChat(chatId);
    } catch (error) {
      throw error;
    }

    try {
      const foundMessages = await this.messageRepository.find({
        where: {
          chat: { id: foundChat.id },
          content: ILike(`%${query.keyword ?? ''}%`),
        },
        take: query.size,
      });

      const responseMessages: Array<RespondMessageDto> = foundMessages.map(
        (message) => plainToInstance(RespondMessageDto, message),
      );

      const responseDto = new ResponseSearchedMessagesDto(responseMessages);

      return responseDto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot search messages in conversation id = \`${chatId}\` with keyword = \`${query.keyword ?? ''}\`, ${error.message}`,
      );
    }
  }

  async createAiMessage(query: createMessageDto): Promise<Message> {
    const aiResponse = await this.geminiService.generateResponse(query.content);
    const chat = await this.chatRepository.findChat(query.chatId);

    try {
      return await this.messageRepository.save({
        content: aiResponse.content,
        chat: chat,
      });
    } catch (error) {
      throw new InternalServerErrorException(`failed to store Message`);
    }
  }

  async createAiMessageWithoutLogin(
    question: string,
  ): Promise<AiRespondWithoutLoginDto> {
    const aiResponse = await this.geminiService.generateResponse(question);

    const response = new AiRespondWithoutLoginDto(aiResponse);
    return response;
  }

  async createTempMessage(
    message: string,
    creatorId: string,
  ): Promise<RespondCreatedFirstMessageDto> {
    try {
      const title = await this.geminiService.generateSummary(message);

      const respondMessage = await this.messageRepository.save({
        content: message,
        createdByUserId: creatorId,
      });

      return new RespondCreatedFirstMessageDto({
        chatTitle: title.content,
        message: respondMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  async createMessage(
    query: createMessageDto,
    creatorId: string,
  ): Promise<RespondMessageDto> {
    const chat = await this.chatRepository.findChat(query.chatId);

    try {
      return await this.messageRepository.saveAndReturnDto({
        chat: chat,
        content: query.content,
        createdByUserId: creatorId,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to store message.');
    }
  }

  async editContentMessage(
    query: EditMessageDto,
    userId: string,
  ): Promise<RespondMessageDto> {
    try {
      await this.messageRepository.update(
        { id: query.id },
        {
          content: query.content,
          createdByUserId: userId,
        },
      );

      const editedMessage = await this.messageRepository.findOneBy({
        id: query.id,
      });
      if (!editedMessage)
        throw new InternalServerErrorException('Message not found');
      const response = plainToInstance(RespondMessageDto, editedMessage);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async softRemoveMessage(id: string): Promise<boolean> {
    try {
      await this.messageRepository.softDelete(id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('fail to remove message');
    }
  }

  async removeAllMessagesFromChat(
    chat: Chat,
    entityManager: EntityManager,
  ): Promise<boolean> {
    try {
      await entityManager
        .getRepository(Message)
        .softDelete({ chat: { id: chat.id } });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to remove messages for chat ${chat.id}: ${error.message}`,
      );
    }
  }

  async getUnreadMessagesInChat(chatId: string): Promise<RespondMessageDto[]> {
    return this.messageRepository.findUnreadMessageInChat(chatId);
  }

  async readMessages(messageIds: string[]) {
    await this.messageRepository.update(
      { id: In(messageIds) },
      { isRead: true },
    );
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { RespondCreatedFirstMessageDto } from './dtos/respond-created-first-message.dto';
import { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../chats/entities/chat.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
    //pending Chat API management
    // private readonly chatsService: ChatsService,
    //pending User API management
    // private readonly usersService: UsersService,
  ) {}

  async createFirstMessage(
    message: string,
    creator: User,
  ): Promise<RespondCreatedFirstMessageDto> {
    throw new Error('Method not implemented.');
  }

  async removeAllMessagesFromChat(chat: Chat, entityManager: EntityManager) {
    throw new Error('Method not implemented.');
  }

  async getMessageInChat(chatId): Promise<Message[]> {
    // const chat = await this.chatService.findOne({
    //     where: { id: chatId },
    // })
    // if (!chat) throw new Error(`Messages in Chat with id:${chatId} not found!`);

    const messages = await this.repo.find({
      where: { chat: { id: chatId } },
    });
    return messages;
  }

  async createFirstAiMessage(content: string): Promise<Message> {
    const message = this.repo.create({
      content: content,
      isRead: false,
    });

    return message;
  }

  async createAiMessage(chatId: string, content: string): Promise<Message> {
    //find chat pending
    // const chat = await this.chatRepo.findOne({
    //     where: { id: chatId },
    // })
    // //if notfound
    // if (!chat) throw new Error(`Chat with ${chatId} not Found!`);

    const message = this.repo.create({
      content: content,
      chat: { id: chatId }, //pending chat API management
      isRead: false,
    });

    return message;
  }

  async createAiMessageWithoutLogin(
    ask: string,
  ): Promise<RespondAiMessageWithoutLoginDto> {
    //call API gemini , pending
    const content = 'this is response of Gemini if answer not in document';
    const now = new Date();

    const response = new RespondAiMessageWithoutLoginDto({
      content: content,
      createdAt: now,
    });
    return response;
  }
  async createFirstUserMessage(
    userId: string,
    content: string,
  ): Promise<Message> {
    //pending
    // const user = await this.usersService.findOne({
    //     where: {id : userId},
    // })

    const message = this.repo.create({
      content: content,
      updatedByUserId: userId,
      createdAt: new Date(),
      isRead: false,
    });
    return message;
  }

  async createUserMessage(
    chatId: string,
    userId: string,
    content: string,
  ): Promise<Message> {
    //pending Chat and User API Management
    const chat = new Chat();

    const message = this.repo.create({
      chat: chat,
      content: content,
      createdAt: new Date(),
      createdByUserId: userId,
      isRead: false,
    });
    const saved = await this.repo.save(message);
    return saved;
  }

  async editContentMessage(
    userId: string,
    messageId: string,
    newContent: string,
  ): Promise<RespondMessageDto> {
    //find message to edit
    const message = await this.repo.findOne({
      where: { id: messageId },
    });

    if (!message)
      throw new NotFoundException(
        `this Message with id:${messageId} not found!`,
      );

    if (!message.createdByUserId && message.createdByUserId !== userId)
      throw new Error(
        `this User does not have permission to edit this message`,
      );
    //replace new value and updated_At;
    message.content = newContent;
    message.updatedAt = new Date();
    //save to database
    const saved = await this.repo.save(message);
    //return response to client
    const response = new RespondMessageDto({
      content: saved.content,
      chat: saved.chat,
      createdAt: saved.createdAt,
      createdByUserId: saved.createdByUserId,
    });
    return response;
  }

  async softRemoveMessage(
    messageId: string,
  ): Promise<{ responseMessage: string }> {
    const message = await this.repo.findOne({
      where: { id: messageId },
    });
    if (!message)
      throw new NotFoundException(`Message with id:${messageId} not found`);

    message.deletedAt = new Date();
    await this.repo.save(message);

    return { responseMessage: 'Message deleted successfully.' };
  }

  async removeMessagesInChat(
    chatId: string,
  ): Promise<{ responseMessage: string }> {
    const messages = await this.repo.find({
      where: {
        chat: { id: chatId },
      },
    });
    if (!messages || messages.length === 0)
      throw new NotFoundException(`No message found for this chat.`);

    const now = new Date();
    for (const msg of messages) {
      msg.deletedAt = now;
    }
    await this.repo.save(messages);

    return {
      responseMessage: `All Message in Chat ${chatId} were deleted successfully.`,
    };
  }
}

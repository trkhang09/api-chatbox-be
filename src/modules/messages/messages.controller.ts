import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { MessagesService } from './messages.service';
import type { Response } from 'express';
import { AiRespondWithoutLoginDto } from './dtos/ai-respond-without-login.dto';
import { Public } from '../auth/public.decorator';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('/')
  async getMessagesInConversation(
    @Query() query: GetMessagesInChatDto,
  ): Promise<ResponsePaginateDto<RespondMessageDto>> {
    try {
      const respond = await this.messagesService.getMessagesInChat(query);
      return respond;
    } catch (error) {
      throw error;
    }
  }
}

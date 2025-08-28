import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { MessagesService } from './messages.service';
import type { Response } from 'express';
import { AiRespondWithoutLoginDto } from './dtos/ai-respond-without-login.dto';
import { Public } from '../auth/public.decorator';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('ai/without-login')
  @Public()
  async createdAIMessageWithoutLogin(
    @Body() question: string,
  ): Promise<AiRespondWithoutLoginDto> {
    try {
      const response =
        await this.messagesService.createAiMessageWithoutLogin(question);
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Get('/')
  async getMessagesInConversation(@Query() query: GetMessagesInChatDto) {
    try {
      const respond = await this.messagesService.getMessagesInChat(query);
      return respond;
    } catch (error) {}
  }
}

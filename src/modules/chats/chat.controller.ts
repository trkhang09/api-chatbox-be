import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from '../users/entities/user.entity';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { CreateNewChatDto } from './dtos/create-new-chat.dto';
import { ChangeChatTitleDto } from './dtos/change-chat-title.dto';
import { SearchChatDto } from './dtos/search-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/batched')
  async getChatBatch(
    @Query() query: GetBatchedChatDto,
    /*@JWTUser()*/ user: User,
  ) {
    try {
      const conversations = await this.chatService.getChatBatch(query, user);
      return conversations;
    } catch (error) {
      throw error;
    }
  }

  @Post('/')
  async createNewChatWithMessage(
    @Body() body: CreateNewChatDto,
    /*@JWTUser()*/ user: User,
  ) {
    try {
      const createdChat = await this.chatService.createNewChatWithMessage(
        body,
        user,
      );

      return createdChat;
    } catch (error) {
      throw error;
    }
  }

  @Put('/')
  async changeChatTitle(@Body() body: ChangeChatTitleDto) {
    try {
      const changedChat = await this.chatService.changeChatTitle(body);

      return changedChat;
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  async removeChatHistory(@Param('id') id: string) {
    try {
      const removedChat = await this.chatService.removeChatHistory(id);

      return removedChat;
    } catch (error) {
      throw error;
    }
  }

  // @Get('/search')
  // async searchChatsByTitle(@Res() res, @Query() query: SearchChatDto) {
  //   try {
  //     const foundChats = await this.chatService.searchChatsByTitle(
  //       query.key,
  //       query.limit,
  //     );

  //     return res.status(200).json(foundChats);
  //   } catch (error) {
  //     // InternalServerErrorException
  //     return res.status(500).json(error.message);
  //   }
  // }
}

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
    @Res() res,
    @Body() body: CreateNewChatDto,
    /*@JWTUser()*/ user: User,
  ) {
    // GET RECEIVER
    const receiver: User = {
      id: body.receiverId,
    } as User;

    try {
      const createdChat = await this.chatService.createNewChatWithMessage(
        body.message,
        user,
        receiver,
      );

      return res.status(201).json(createdChat);
    } catch (error) {
      // InternalServerErrorException
      return res.status(500).json(error.message);
    }
  }

  @Put('/')
  @Patch('/')
  async changeChatTitle(@Res() res, @Body() body: ChangeChatTitleDto) {
    try {
      const changedChat = await this.chatService.changeChatTitle(
        body.id,
        body.title,
      );

      return res.status(200).json(changedChat);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.status(400).json(error.message);
      }

      if (error instanceof NotFoundException) {
        return res.status(404).json(error.message);
      }

      // InternalServerErrorException
      return res.status(500).json(error.message);
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

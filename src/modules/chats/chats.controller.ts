import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { User } from '../users/entities/user.entity';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { CreateNewChatDto } from './dtos/create-new-chat.dto';
import { ChangeChatTitleDto } from './dtos/change-chat-title.dto';
import { RemoveChatHistoryDto } from './dtos/remove-chat-history.dto';
import { SearchChatDto } from './dtos/search-chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('/batched')
  async getChatBatch(
    @Res() res,
    @Query() query: GetBatchedChatDto,
    /*@JWTUser()*/ user: User,
  ) {
    try {
      const batch = await this.chatsService.getChatBatch(
        query.batch,
        query.limit,
        query.type,
        user,
      );

      return res.status(200).json(batch);
    } catch (error) {
      // InternalServerErrorException
      return res.status(500).json(error.message);
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
      const createdChat = await this.chatsService.createNewChatWithMessage(
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
      const changedChat = await this.chatsService.changeChatTitle(
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

  @Delete('/')
  async removeChatHistory(@Res() res, @Query() query: RemoveChatHistoryDto) {
    try {
      const removedChat = await this.chatsService.removeChatHistory(query.id);

      return res.status(200).json(removedChat);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).json(error.message);
      }

      // InternalServerErrorException
      return res.status(500).json(error.message);
    }
  }

  @Get('/search')
  async searchChatsByTitle(@Res() res, @Query() query: SearchChatDto) {
    try {
      const foundChats = await this.chatsService.searchChatsByTitle(
        query.key,
        query.limit,
      );

      return res.status(200).json(foundChats);
    } catch (error) {
      // InternalServerErrorException
      return res.status(500).json(error.message);
    }
  }
}

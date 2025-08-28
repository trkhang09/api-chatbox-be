import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Sse,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from '../users/entities/user.entity';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { CreateNewChatDto } from './dtos/create-new-chat.dto';
import { ChangeChatTitleDto } from './dtos/change-chat-title.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { RespondChatDto } from './dtos/respond-chat.dto';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { RespondCreatedNewChatDto } from './dtos/respond-created-new-chat.dto';
import { RespondChangedChatTitleDto } from './dtos/respond-changed-chat-title.dto';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { ApiOkResponseCustom } from 'src/common/decorators/api-ok-response.decorator';

@ApiTags('Conversation History')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/batched')
  @ApiOperation({
    summary:
      'Get one batch of conversations of this user in the current page with a specific size',
  })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, RespondChatDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  async getChatBatch(
    @Query() query: GetBatchedChatDto,
    /*@JWTUser()*/ user: User,
  ) {
    try {
      const conversations = await this.chatService.getChatBatch(query, user);

      // conversations.data.map((c) => c as RespondChatDto);

      return conversations;
    } catch (error) {
      throw error;
    }
  }

  @Post('/')
  @ApiOperation({
    summary: 'Create a new conversation with the new message included',
  })
  @ApiCommonResponseCustom(RespondCreatedNewChatDto)
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
  @ApiOperation({
    summary: 'Change the new title for a specific conversation',
  })
  @ApiCommonResponseCustom(RespondChangedChatTitleDto)
  @ApiNotFoundResponseCustom()
  async changeChatTitle(@Body() body: ChangeChatTitleDto) {
    try {
      const changedChat = await this.chatService.changeChatTitle(body);

      return changedChat;
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Softly remove a specific conversation history',
  })
  @ApiOkResponseCustom(Boolean, true)
  @ApiNotFoundResponseCustom()
  @ApiInternalServerErrorResponseCustom()
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

  /**
   * generate response stream
   */

  @Get('generate')
  async generate() {
    return await this.chatService.generate();
  }
}

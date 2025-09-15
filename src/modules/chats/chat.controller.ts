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
import {
  ChatService,
  DashboardForConversationRequestDto,
} from './chat.service';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { CreateNewChatDto } from './dtos/create-new-chat.dto';
import { ChangeChatTitleDto } from './dtos/change-chat-title.dto';
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
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
import { Observable } from 'rxjs';
import { Public } from '../auth/public.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { ApiDashboardQuantity } from 'src/common/decorators/api-dashboard-quantity.decorator';
import { isNumber } from 'class-validator';
import { getEnumJoin } from 'src/common/utils/get-enum-join';
import { RespondLatestChatDto } from './dtos/respond-latest-chat.dto';

@ApiTags('Conversation History')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get conversations with status/type within s specifi days',
  })
  @ApiQuery({
    name: 'status',
    enum: Object.values(ChatTypes).filter((v) => isNumber(v)),
    description: 'Status value, must be one of: ' + getEnumJoin(ChatTypes),
    example: Object.values(ChatTypes)[0],
  })
  @ApiQuery({
    name: 'days',
    type: Number,
    description: 'Number of days (max 90)',
    minimum: 1,
    maximum: 90,
    example: 30,
  })
  @ApiCommonResponseCustom(Array<RespondChatDto>)
  async getAllConversations(
    @Query() query: InstanceType<typeof DashboardForConversationRequestDto>,
  ) {}

  @ApiDashboardQuantity(ChatTypes)
  async getQuantity(
    @Query() query: InstanceType<typeof DashboardForConversationRequestDto>,
  ) {
    return this.chatService.getQuantity(query);
  }

  @Get('/latest')
  @ApiOperation({
    summary:
      'Get list of conversations with or without status within a specific number of days',
  })
  @ApiQuery({
    name: 'status',
    enum: Object.values(ChatTypes).filter((v) => isNumber(v)),
    description: 'Status value, must be one of: ' + getEnumJoin(ChatTypes),
    example: Object.values(ChatTypes)[0],
    required: false,
  })
  @ApiQuery({
    name: 'days',
    type: Number,
    description: 'Number of days (max 90)',
    minimum: 1,
    maximum: 90,
    example: 30,
  })
  @ApiCommonResponseCustom(Array<RespondLatestChatDto>, [
    {
      id: 'a3e0f6f4-9d71-4b87-8c90-72fb8c739f4c',
      title: 'Project Discussion',
      createdAt: '2025-08-27T09:00:00.000Z',
      type: ChatTypes.BOT,
      participants: [
        {
          id: '8f5d6b20-2e3d-4f0b-b1a3-6f5b9a2f3c4d',
          email: 'johndoe@example.com',
          fullname: 'John Doe',
          createdAt: '2025-09-09T08:30:00.000Z',
          updatedAt: '2025-09-09T08:45:00.000Z',
          createdByUserId: '123e4567-e89b-12d3-a456-426614174000',
          status: 1,
        },
      ],
      messagesCount: 42,
    },
  ])
  async getLatestDocuments(
    @Query() query: InstanceType<typeof DashboardForConversationRequestDto>,
  ) {
    return this.chatService.getLatestConversations(query);
  }

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
    @AuthUser() user: AuthUserDto,
  ) {
    try {
      const conversations = await this.chatService.getChatBatch(
        query,
        user.sub,
      );

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
    @AuthUser() user: AuthUserDto,
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

  /**
   * generate response stream
   */
  @ApiOperation({
    summary: 'chats generate answer with ai',
  })
  @Public()
  @ApiOkResponseCustom(Observable<MessageEvent>, true)
  @Sse('generate')
  generate(@Query('question') question: string): Observable<MessageEvent> {
    return this.chatService.generate(question);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'get conversation with users by conversation id',
  })
  async getChatById(@Param('id') id: string, @AuthUser('sub') userId: string) {
    return this.chatService.findChatById(id, userId);
  }
}

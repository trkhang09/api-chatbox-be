import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ChatService,
  DashboardForConversationRequestDto,
} from './chat.service';
import { GetBatchedChatDto } from './dtos/get-batched-chat.dto';
import { CreateNewChatDto } from './dtos/create-new-chat.dto';
import { ChangeChatTitleDto } from './dtos/change-chat-title.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
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
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { ApiDashboardQuantity } from 'src/common/decorators/api-dashboard-quantity.decorator';
import { isNumber } from 'class-validator';
import { getEnumJoin } from 'src/common/utils/get-enum-join';
import { ChatGenerateAiDto } from './dtos/chat-generate-ai.dto';
import { RespondLatestChatDto } from './dtos/respond-latest-chat.dto';
import { Setting } from 'src/common/decorators/setting.decorator';
import { SettingConstants } from 'src/common/constants/setting-constrants';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionType } from 'src/common/constants/permission-constants';
import type { Response, Request } from 'express';
import { CreateMessageDto } from '../messages/dtos/create-message.dto';

@ApiTags('Conversation History')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiDashboardQuantity(ChatTypes)
  @Permissions(PermissionType.CONVERSATION_GET)
  async getQuantity(
    @Query() query: InstanceType<typeof DashboardForConversationRequestDto>,
  ) {
    return this.chatService.getQuantity(query);
  }

  @Get('/latest')
  @Permissions(PermissionType.CONVERSATION_GET)
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
  async getLatestConversations(
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
  @Setting(SettingConstants.ALLOW_CHATBOX_NO_LOGIN)
  @ApiOkResponse({
    description: 'SSE stream established',
    content: {
      'text/event-stream': {
        schema: {
          oneOf: [
            { $ref: '#/components/schemas/SseDeltaDto' },
            { $ref: '#/components/schemas/SseMessageDto' },
          ],
        },
        examples: {
          delta: {
            summary: 'Delta example',
            value: {
              chatId: 'e7b8e8c3-7c0d-4d5a-9c6a-2fbb5c5f2a77',
              content: 'Hello, ',
            },
          },
          message: {
            summary: 'Message example',
            value: {
              chatId: 'e7b8e8c3-7c0d-4d5a-9c6a-2fbb5c5f2a77',
              type: 'complete',
            },
          },
        },
      },
    },
  })
  @Post('conversation')
  async generateConversation(
    @Body() dto: ChatGenerateAiDto,
    @AuthUser() user: AuthUserDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('charset', 'utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const item of this.chatService.generate(dto, user)) {
        res.write(`event: ${item.event}\n`);
        res.write(`data: ${JSON.stringify(item.data)}\n\n`);
      }

      res.write(`event: done\ndata: [DONE]\n\n`);
      res.end();
    } catch (err) {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`,
      );
      res.end();
    }
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'get conversation with users by conversation id',
  })
  @ApiNotFoundResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  async getChatById(@Param('id') id: string, @AuthUser('sub') userId: string) {
    return this.chatService.findChatById(id, userId);
  }

  @Post('/admin')
  @ApiOperation({
    summary: 'create new convesation with admin',
  })
  async createNewConversation(
    @Body() body: CreateNewChatDto,
    @AuthUser('sub') userId: string,
  ) {
    return this.chatService.createNewConversationWithAdmin(
      body.message,
      userId,
    );
  }

  @Post('/admin/join')
  @ApiNotFoundResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  @ApiBadRequestResponseCustom()
  @ApiOperation({
    summary: 'admin join conversation to reply user',
  })
  async joinConversationByAdmin(
    @AuthUser() authUserDto: AuthUserDto,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.joinConversationByAdmin(
      createMessageDto,
      authUserDto,
    );
  }

  @Get('/admin/list')
  @ApiOperation({
    summary:
      'Get one batch of conversations of this user in the current page with a specific size',
  })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, RespondChatDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  async getUnansweredConversation(
    @Query() query: GetBatchedChatDto,
    @AuthUser('sub') userId: string,
  ) {
    return this.chatService.getUnansweredConversations(query, userId);
  }
}

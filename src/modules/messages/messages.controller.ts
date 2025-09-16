import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { createMessageDto } from './dtos/create-message.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { EditMessageDto } from './dtos/edit-message.dto';
import { ApiOkResponseCustom } from 'src/common/decorators/api-ok-response.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { GetMessagesInChatCursorPaginationDto } from './dtos/get-message-in-chat-cursor-pagination.dto';
import { ResponseGetMessageInChatDto } from './dtos/response-get-messages-in-chat.dto';

@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('/')
  @ApiOperation({
    summary: 'get list of messages in a specific conversation',
  })
  @ApiCommonResponseCustom(ResponseGetMessageInChatDto)
  @ApiInternalServerErrorResponse()
  @ApiBadRequestResponseCustom()
  async getMessagesWithCursorPagination(
    @Query() query: GetMessagesInChatCursorPaginationDto,
  ) {
    return this.messagesService.getMessagesWithCursorPagination(query);
  }

  @Post('/')
  @ApiOperation({
    summary: 'Create a new message',
  })
  @ApiCommonResponseCustom(RespondMessageDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponse()
  async createMessage(
    @Body() body: createMessageDto,
    @AuthUser('sub') creatorId: string,
  ) {
    return this.messagesService.createMessage(body, creatorId);
  }

  @Put('/')
  @ApiOperation({
    summary: 'edit content message',
  })
  @ApiCommonResponseCustom(RespondMessageDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponse()
  @ApiNotFoundResponse()
  async editMessage(
    @Body() body: EditMessageDto,
    @AuthUser('sub') userId: string,
  ) {
    return this.messagesService.editContentMessage(body, userId);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Softly remove a specific message',
  })
  @ApiOkResponseCustom(Boolean, true)
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async removeMessage(@Param('id') id: string) {
    return this.messagesService.softRemoveMessage(id);
  }
}

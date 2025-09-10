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
import { User } from '../users/entities/user.entity';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { EditMessageDto } from './dtos/edit-message.dto';
import { ApiOkResponseCustom } from 'src/common/decorators/api-ok-response.decorator';

@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get list of messages in a specific conversation',
  })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, RespondMessageDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponse()
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
  @Post('/')
  @ApiOperation({
    summary: 'Create a new message',
  })
  @ApiCommonResponseCustom(RespondMessageDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponse()
  async createMessage(@Body() body: createMessageDto, creator: User) {
    return this.messagesService.createMessage(body, creator);
  }

  @Put('/')
  @ApiOperation({
    summary: 'edit content message',
  })
  @ApiCommonResponseCustom(RespondMessageDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponse()
  @ApiNotFoundResponse()
  async editMessage(@Body() body: EditMessageDto, user: User) {
    return this.messagesService.editContentMessage(body, user);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Softly remove a specific message',
  })
  @ApiOkResponseCustom(Boolean, true)
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async removeMessage(@Param('id') id: string, user: User) {
    return this.messagesService.softRemoveMessage(id, user);
  }
}

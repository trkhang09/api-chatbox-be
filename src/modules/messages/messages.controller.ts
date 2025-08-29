import { Controller, Get, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { GetMessagesInChatDto } from './dtos/get-message-in-chat.dto';
import { RespondMessageDto } from './dtos/respond-message.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiInternalServerErrorResponse, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';

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
}

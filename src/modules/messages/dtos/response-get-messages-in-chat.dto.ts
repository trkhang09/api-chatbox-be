import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { RespondMessageDto } from './respond-message.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetMessageInChatDto {
  @ApiProperty({
    type: [RespondMessageDto],
    description: 'a list of message in conversations',
  })
  messages: RespondMessageDto[];

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'older message received time',
    example: '2025-09-16T10:20:30.000Z',
  })
  cursor: Date | null;
}

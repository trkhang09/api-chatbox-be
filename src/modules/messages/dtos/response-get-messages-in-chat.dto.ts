import { RespondMessageDto } from './respond-message.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetMessageInChatDto {
  @ApiProperty({
    type: [RespondMessageDto],
    description: 'a list of message in conversations',
  })
  messages: RespondMessageDto[];

  @ApiProperty({
    description: 'Pagination cursors for fetching next or previous messages',
    example: {
      first: '2025-09-12T10:15:30.000Z',
      last: '2025-09-12T10:20:45.000Z',
    },
    required: false,
  })
  cursors?: {
    first: string;
    last: string;
  };
}

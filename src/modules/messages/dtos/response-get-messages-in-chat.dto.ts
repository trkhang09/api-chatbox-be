import { RespondMessageDto } from './respond-message.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseGetMessageInChatDto {
  @ApiProperty({
    type: [RespondMessageDto],
    description: 'A list of messages in the conversation',
  })
  messages: RespondMessageDto[];

  @ApiPropertyOptional({
    description: 'Pagination cursors for fetching next or previous messages',
    example: {
      first: '2025-09-12T10:15:30.000Z',
      last: '2025-09-12T10:20:45.000Z',
    },
  })
  cursors?: {
    first: string;
    last: string;
  };

  @ApiPropertyOptional({
    description: 'Indicates if there are more messages available',
    example: {
      prev: true,
      next: false,
    },
  })
  hasMore?: {
    prev?: boolean;
    next?: boolean;
  };
}

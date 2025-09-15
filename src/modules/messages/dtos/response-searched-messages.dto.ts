import { ApiProperty } from '@nestjs/swagger';
import { RespondMessageDto } from './respond-message.dto';

export class ResponseSearchedMessagesDto {
  @ApiProperty({
    description: 'The list of messages that match the given keyword',
    type: RespondMessageDto,
    isArray: true,
    example: [
      {
        id: '7e8f9b3c-45a1-4d02-bc89-1c3d4f5a6e7f',
        content: 'This is a matched message',
        createdByUserId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2025-09-08T10:15:00.000Z',
        isRead: false,
        updatedAt: '2025-09-08T10:20:00.000Z',
      },
      {
        id: 'b9a8c7d6-12f3-4d56-b89a-9c8f7d6a5e4c',
        content: 'Another message containing the keyword',
        createdByUserId: '987e6543-e21b-34c5-a789-426614174111',
        createdAt: '2025-09-08T11:00:00.000Z',
        isRead: true,
        updatedAt: '2025-09-08T11:05:00.000Z',
      },
    ],
  })
  messages: RespondMessageDto[];

  @ApiProperty({
    description: 'The total number of messages matching the keyword',
    example: 60,
  })
  messagesCount: number;

  constructor(messages: RespondMessageDto[]) {
    this.messages = messages;
    this.messagesCount = messages.length;
  }
}

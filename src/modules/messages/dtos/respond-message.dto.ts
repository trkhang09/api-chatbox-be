import { ApiProperty } from '@nestjs/swagger';

export class RespondMessageDto {
  @ApiProperty({
    description: 'Unique identifier of the message',
    example: '1f2d3c4b-5a6e-7d8f-9012-3456789abcde',
  })
  id: string;

  @ApiProperty({
    description: 'The actual text/content of the message',
    example: 'Hello, how are you?',
  })
  content: string;

  @ApiProperty({
    description: 'The ID of the user who created the message',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
  })
  createdByUserId: string;

  @ApiProperty({
    description: 'The date and time when the message was created',
    type: String,
    format: 'date-time',
    example: '2025-08-27T15:45:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Indicates whether the message has been read',
    type: Boolean,
    example: false,
  })
  isRead: boolean;

  constructor(partial: Partial<RespondMessageDto>) {
    Object.assign(this, partial);
  }
}

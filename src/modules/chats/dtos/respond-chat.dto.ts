import { ApiProperty } from '@nestjs/swagger';
import { ChatTypes } from 'src/common/enums/chat-type.enum';

export class RespondChatDto {
  @ApiProperty({
    description: 'Unique identifier of the chat',
    example: 'a3e0f6f4-9d71-4b87-8c90-72fb8c739f4c',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the chat',
    example: 'Project Discussion',
  })
  title: string;

  @ApiProperty({
    description: 'Timestamp when the chat was created',
    example: '2025-08-27T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Type of the chat',
    enum: ChatTypes,
    example: ChatTypes.BOT,
  })
  type: ChatTypes;
}

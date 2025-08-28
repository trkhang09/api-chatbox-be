import { ApiProperty } from '@nestjs/swagger';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { Message } from 'src/modules/messages/entities/messages.entity';

export class RespondCreatedNewChatDto {
  @ApiProperty({
    description: 'Unique identifier of the chat',
    example: 'e7b8e8c3-7c0d-4d5a-9c6a-2fbb5c5f2a77',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the chat',
    example: 'Project Discussion',
  })
  title: string;

  @ApiProperty({
    description: 'Type of the chat (e.g., with bot, with other user)',
    enum: ChatTypes,
    example: ChatTypes.BOT,
  })
  type: ChatTypes;

  @ApiProperty({
    description: 'Messages included in the chat',
    type: [Message], // WAITING FOR MESSAGE MODULE
  })
  messages: Message[];

  @ApiProperty({
    description: 'Date and time when the chat was created',
    example: '2025-08-27T12:34:56.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<RespondCreatedNewChatDto>) {
    Object.assign(this, partial);
  }
}

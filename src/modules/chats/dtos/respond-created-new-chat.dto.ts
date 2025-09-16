import { ApiProperty } from '@nestjs/swagger';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { Message } from 'src/modules/messages/entities/messages.entity';
import { UserDto } from 'src/modules/users/dtos/user.dto';

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
    type: [Message],
  })
  messages: Message[];

  @ApiProperty({
    description: 'Date and time when the chat was created',
    example: '2025-08-27T12:34:56.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Receiver in the new chat created by User',
    oneOf: [
      {
        example: {
          id: '8f5d6b20-2e3d-4f0b-b1a3-6f5b9a2f3c4d',
          email: 'johndoe@example.com',
          fullname: 'John Doe',
          role: 'user',
          createdAt: '2025-09-09T08:30:00.000Z',
          updatedAt: '2025-09-09T08:45:00.000Z',
          createdByUserId: '123e4567-e89b-12d3-a456-426614174000',
          status: 1,
        },
      },
      {
        example: undefined,
      },
    ],
  })
  receiver?: UserDto;

  constructor(partial: Partial<RespondCreatedNewChatDto>) {
    Object.assign(this, partial);
  }
}

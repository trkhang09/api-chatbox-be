import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { UserDto } from 'src/modules/users/dtos/user.dto';

@Exclude()
export class RespondChatDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the chat',
    example: 'a3e0f6f4-9d71-4b87-8c90-72fb8c739f4c',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Title of the chat',
    example: 'Project Discussion',
  })
  title: string;

  @Expose()
  @ApiProperty({
    description: 'Timestamp when the chat was created',
    example: '2025-08-27T09:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Type of the chat',
    enum: ChatTypes,
    example: ChatTypes.BOT,
  })
  type: ChatTypes;

  @Expose()
  @ApiProperty({
    description: 'another user in this chat',
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

  constructor(partial: Partial<RespondChatDto>) {
    Object.assign(this, partial);
  }
}

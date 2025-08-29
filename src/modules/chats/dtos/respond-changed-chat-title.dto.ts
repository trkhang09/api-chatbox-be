import { ApiProperty } from '@nestjs/swagger';

export class RespondChangedChatTitleDto {
  @ApiProperty({
    description: 'Unique identifier of the chat',
    example: 'e7b8e8c3-7c0d-4d5a-9c6a-2fbb5c5f2a77',
  })
  id: string;

  @ApiProperty({
    description: 'The new title assigned to the chat',
    example: 'Updated Project Discussion',
  })
  newTitle: string;

  @ApiProperty({
    description: 'Date and time when the chat title was last updated',
    example: '2025-08-27T12:45:30.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<RespondChangedChatTitleDto>) {
    Object.assign(this, partial);
  }
}

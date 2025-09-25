import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description:
      'The unique identifier (UUID v4) of the chat where the message will be sent',
    example: 'd7a3f5b1-9c2e-4f1d-8a56-3b0e1a87c9e2',
  })
  @IsUUID(4)
  readonly chatId: string;

  @ApiProperty({
    description: 'The content of the message that will be sent to the chat',
    example: 'Hello everyone, how are you today?',
  })
  @IsString()
  @IsNotEmpty()
  readonly content: string;
}

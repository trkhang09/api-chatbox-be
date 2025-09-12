import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatGenerateAiDto {
  @ApiProperty({
    description: 'The prompt or question to generate a response for',
    example: 'Explain the theory of relativity in simple terms.',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The ID of the chat session (optional)',
    example: 'chat-12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  chatId?: string;
}

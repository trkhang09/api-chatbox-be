import { ApiProperty } from '@nestjs/swagger';

export class SseDeltaDto {
  @ApiProperty({
    description:
      'Unique identifier of the chat session. Null if the message is not tied to a chat yet.',
    example: 'e7b8e8c3-7c0d-4d5a-9c6a-2fbb5c5f2a77',
    nullable: true,
  })
  chatId: string | null;

  @ApiProperty({
    description:
      'Delta content of the message (partial or incremental content). Null if no new content.',
    example: 'Hello, how can I help you?',
    nullable: true,
  })
  content: string | null;
}

export class SseMessageDto {
  @ApiProperty({
    description:
      'Unique identifier of the chat session. Null if the message is not tied to a chat yet.',
    example: 'e7b8e8c3-7c0d-4d5a-9c6a-2fbb5c5f2a77',
    nullable: true,
  })
  chatId: string | null;

  @ApiProperty({
    description:
      'Type of the SSE message (e.g., "delta", "complete", "error").',
    example: 'delta',
  })
  type: string;
}

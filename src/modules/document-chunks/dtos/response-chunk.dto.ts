import { ApiProperty } from '@nestjs/swagger';

export class ResponseChunkDto {
  @ApiProperty({
    description: 'Unique identifier of the chunk',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'The actual content of the chunk',
    example: 'This is a response message chunk.',
  })
  content: string;

  @ApiProperty({
    description: 'Timestamp when the chunk was created',
    type: String,
    example: '2025-09-08T12:34:56.000Z',
  })
  createdAt: Date;
}

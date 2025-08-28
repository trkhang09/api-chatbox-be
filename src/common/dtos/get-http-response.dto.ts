import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class GetHttpResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code',
    enum: HttpStatus,
    example: '200',
  })
  statusCode: HttpStatus;

  @ApiProperty({
    description: 'Error message or validation details',
    example: 'Invalid input data',
    type: [String],
  })
  message: string[];

  @ApiPropertyOptional({
    description: 'Always {} for error responses',
    nullable: true,
  })
  data?: T;

  @ApiProperty({
    description: 'The timestamp when the error occurred',
    example: '2025-08-25T09:00:00.000Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Request path where the error occurred',
    example: '/api/chats/batched',
  })
  path: string;
}

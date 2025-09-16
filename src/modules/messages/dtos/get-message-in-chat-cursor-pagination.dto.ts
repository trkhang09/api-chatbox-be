import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class GetMessagesInChatCursorPaginationDto {
  @ApiProperty({
    description: 'Chat ID',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
  })
  @IsUUID()
  readonly chatId: string;
  @ApiPropertyOptional({
    description: 'Number of messages to retrieve',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly size: number = 20;

  @ApiPropertyOptional({
    description: 'older message received time',
    example: '2025-09-10T12:00:00Z',
  })
  @Transform(({ value }) => (value === '' ? undefined : value)) // nếu chuỗi rỗng => undefined
  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  readonly cursor?: string;
}

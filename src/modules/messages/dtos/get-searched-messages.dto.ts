import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetSearchedMessagesDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Keyword used to search for messages (case-insensitive)',
    example: 'Hello world',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string;

  @ApiPropertyOptional({
    description: 'The unique identifier of the sender (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  readonly senderId?: string;

  @ApiPropertyOptional({
    description: 'The start date to filter messages (inclusive)',
    type: String,
    format: 'date',
    example: '2025-09-01',
  })
  @IsOptional()
  @IsDateString()
  readonly startedDate?: string;

  @ApiPropertyOptional({
    description: 'The end date to filter messages (inclusive)',
    type: String,
    format: 'date',
    example: '2025-09-08',
  })
  @IsOptional()
  @IsDateString()
  readonly endedDate?: string;
}

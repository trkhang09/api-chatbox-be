import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { DirectionConstants } from 'src/common/constants/direction.constants';

export class GetMessagesInChatCursorPaginationDto {
  @ApiProperty({
    description: 'Chat ID',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
  })
  @IsUUID()
  readonly chatId: string;

  @ApiProperty({
    description: 'Number of messages to retrieve',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly size: number = 20;

  @ApiProperty({
    description: 'older message received time',
    example: '2025-09-10T12:00:00Z',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  readonly cursor?: string;

  @ApiProperty({
    description:
      'Pagination direction. Use "next" to load newer messages after the cursor, or "prev" to load older messages before the cursor, "both" to load around cursor message with "size" messages .',
    example: DirectionConstants.PREV,
    required: false,
    enum: DirectionConstants,
  })
  @IsOptional()
  @IsEnum(DirectionConstants)
  readonly direction?: DirectionConstants;
}

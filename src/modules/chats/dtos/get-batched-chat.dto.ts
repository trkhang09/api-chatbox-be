import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { Type } from 'class-transformer';

export class GetBatchedChatDto {
  @ApiProperty({
    description: 'The page number to retrieve (must be positive)',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly page: number;

  @ApiProperty({
    description: 'The number of items per page (must be positive)',
    example: 20,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly size: number;

  @ApiProperty({
    description: 'Type of chat to filter',
    enum: ChatTypes,
    example: ChatTypes.BOT,
  })
  @Type(() => Number)
  @IsEnum(ChatTypes)
  readonly type: ChatTypes;

  @ApiPropertyOptional({
    description: 'Optional keyword to search for in chat titles',
    example: 'project discussion',
  })
  @IsOptional()
  @IsString()
  readonly searchKeyword?: string;
}

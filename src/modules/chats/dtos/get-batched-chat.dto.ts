import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { Transform, Type } from 'class-transformer';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetBatchedChatDto extends PaginateDto {
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

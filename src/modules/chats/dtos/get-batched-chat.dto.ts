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
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly page: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly size: number;

  @Type(() => Number)
  @IsEnum(ChatTypes)
  readonly type: ChatTypes;

  @IsOptional()
  @IsString()
  readonly searchKeyword?: string;
}

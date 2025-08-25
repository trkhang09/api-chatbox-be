import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { Type } from 'class-transformer';

export class GetBatchedChatDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly batch: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly limit: number;

  @Type(() => Number)
  @IsEnum(ChatTypes)
  readonly type: ChatTypes;
}

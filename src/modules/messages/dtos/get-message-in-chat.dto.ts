import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class GetMessagesInChatDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly size: number = 10;

  @IsString()
  @IsNotEmpty()
  readonly chatId: string;
}

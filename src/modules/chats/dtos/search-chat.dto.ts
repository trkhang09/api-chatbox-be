import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class SearchChatDto {
  @IsString()
  readonly key: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly limit: number;
}

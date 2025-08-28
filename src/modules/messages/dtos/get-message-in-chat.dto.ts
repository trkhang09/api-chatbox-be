import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetMessagesInChatDto extends PaginateDto {
  @IsString()
  @IsNotEmpty()
  readonly chatId: string;
}

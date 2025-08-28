import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetMessagesInChatDto extends PaginateDto {
  @IsUUID(4)
  @IsNotEmpty()
  readonly chatId: string;
}

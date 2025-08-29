import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetMessagesInChatDto extends PaginateDto {
  @ApiProperty({
    description: 'The unique identifier of the chat to retrieve messages from',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
  })
  @IsUUID(4)
  @IsNotEmpty()
  readonly chatId: string;
}

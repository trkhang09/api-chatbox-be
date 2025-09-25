import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { RespondMessageDto } from 'src/modules/messages/dtos/respond-message.dto';
import { UserDto } from 'src/modules/users/dtos/user.dto';

export class RespondCreateNewChatWithAdminDto {
  id: string;
  title: string;
  users: UserDto[];
  messages: RespondMessageDto[];
  type: ChatTypes;
  createdAt: Date;
  createdByUserId: string;
}

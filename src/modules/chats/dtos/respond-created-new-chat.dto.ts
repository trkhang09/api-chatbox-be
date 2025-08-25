import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { Message } from 'src/modules/messages/entities/messages.entity';

export class RespondCreatedNewChatDto {
  id: string;
  title: string;
  type: ChatTypes;
  messages: Message[];
  createdAt: Date;
}

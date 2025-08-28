import { ChatTypes } from 'src/common/enums/chat-type.enum';

export class RespondChatDto {
  id: string;
  title: string;
  createdAt: Date;
  type: ChatTypes;
}

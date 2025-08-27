import { RespondChatDto } from './respond-chat.dto';

export class RespondBatchedChatsDto {
  batch: number;
  limit: number;
  chats: RespondChatDto[];
  totalInBatch: number;
  totalChats: number;
}

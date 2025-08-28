export class RespondRemovedChatHistoryDto {
  id: string;
  title: string;

  constructor(partial: Partial<RespondRemovedChatHistoryDto>) {
    Object.assign(this, partial);
  }
}

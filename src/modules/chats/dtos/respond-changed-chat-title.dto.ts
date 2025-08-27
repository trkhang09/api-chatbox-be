export class RespondChangedChatTitleDto {
  id: string;
  newTitle: string;
  updatedAt: Date;

  constructor(partial: Partial<RespondChangedChatTitleDto>) {
    Object.assign(this, partial);
  }
}

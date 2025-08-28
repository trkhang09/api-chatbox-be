export class RespondMessageDto {
  id: string;
  content: string;
  createdByUserId: string;
  createdAt: Date;
  isRead: boolean;

  constructor(partial: Partial<RespondMessageDto>) {
    Object.assign(this, partial);
  }
}

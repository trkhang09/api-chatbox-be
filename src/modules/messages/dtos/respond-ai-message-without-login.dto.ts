export class RespondAiMessageWithoutLoginDto {
  content: string;
  createdAt: Date;

  constructor(partial: Partial<RespondAiMessageWithoutLoginDto>) {
    Object.assign(this, partial);
  }
}

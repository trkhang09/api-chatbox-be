export class AiRespondWithoutLoginDto {
  content: string;
  model: string;
  inDocument: boolean;

  constructor(partial: Partial<AiRespondWithoutLoginDto>) {
    Object.assign(this, partial);
  }
}

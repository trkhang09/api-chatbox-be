import { IsUUID } from 'class-validator';

export class RemoveChatHistoryDto {
  @IsUUID(4)
  readonly id: string;
}

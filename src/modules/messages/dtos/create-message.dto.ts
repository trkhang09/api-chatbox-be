import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class createMessageDto {
  @IsUUID(4)
  readonly chatId: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;
}

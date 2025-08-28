import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNewChatDto {
  @IsUUID(4)
  readonly receiverId: string;

  @IsString()
  @IsNotEmpty()
  readonly message: string;
}

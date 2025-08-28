import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ChangeChatTitleDto {
  @IsUUID(4)
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly title: string;
}

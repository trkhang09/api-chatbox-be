import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class EditMessageDto {
  @IsUUID(4)
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;
}

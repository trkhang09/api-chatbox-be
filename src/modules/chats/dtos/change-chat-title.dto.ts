import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ChangeChatTitleDto {
  @ApiProperty({
    description: 'The UUID v4 of the chat whose title will be changed',
    example: 'a3c1f3d6-4d4b-4f7e-8c8d-7d9a2b3c4d5e',
    format: 'uuid',
  })
  @IsUUID(4)
  readonly id: string;

  @ApiProperty({
    description: 'The new title for the chat',
    example: 'Project Alpha Discussion',
  })
  @IsString()
  @IsNotEmpty()
  readonly title: string;
}

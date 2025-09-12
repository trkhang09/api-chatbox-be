import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNewChatDto {
  @ApiPropertyOptional({
    description: 'The UUID v4 of the receiver user',
    example: 'fd73f97a-9427-4999-bb05-756e75b8d286',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4)
  readonly receiverId?: string;

  @ApiProperty({
    description: 'The first message to send when creating the chat',
    example: 'Hey, are you available for a quick call?',
  })
  @IsString()
  @IsNotEmpty()
  readonly message: string;
}

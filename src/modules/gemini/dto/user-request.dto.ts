import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UserRequestDto {
  @ApiProperty({
    description: 'User question or prompt',
    example: 'What is NestJS?',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

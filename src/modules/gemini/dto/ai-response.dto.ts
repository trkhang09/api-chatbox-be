import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AiResponseDto {
  @ApiProperty({
    description: 'Generated text from AI',
    example: 'NestJS is a progressive Node.js framework...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Model used for response generation',
    example: 'gemini-1.5-pro',
  })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Indicates if response is based on internal documents',
    example: true,
  })
  inDocument: boolean;
}

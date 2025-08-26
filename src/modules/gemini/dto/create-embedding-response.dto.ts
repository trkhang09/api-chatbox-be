import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmbeddingResponseDto {
  @ApiProperty({ description: 'The original text chunk' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The embedding vector values', type: [Number] })
  embedding: number[];
}

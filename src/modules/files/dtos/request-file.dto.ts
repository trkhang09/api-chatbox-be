import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestFileDto {
  @ApiPropertyOptional({
    description: 'The name of the file (max 50 characters, without extension)',
    example: 'Document',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  readonly fileName: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'The title of the document',
    example: 'Project Plan',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly title: string;

  @ApiProperty({
    description: 'A short description of the document (optional)',
    example: 'This document contains the detailed project plan for Q1.',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    description: 'The name of the document file (optional, not accept space)',
    example: 'Project_Plan',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[^\s]+$/, {
    message: 'fileName must not contain spaces',
  })
  readonly fileName?: string;
}

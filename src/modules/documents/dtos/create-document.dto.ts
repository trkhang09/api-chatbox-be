import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'The title of the document',
    example: 'Project Plan',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly title: string;

  @ApiProperty({
    description: 'A short description of the document',
    example: 'This document contains the detailed project plan for Q1.',
  })
  @IsString()
  readonly description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Accepted file types: .pdf, .docx',
    example: '',
  })
  @ValidateIf(() => false)
  @IsOptional()
  readonly document: any;
}

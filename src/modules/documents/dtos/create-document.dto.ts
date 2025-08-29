import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
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
    description: 'A short description of the document (optional)',
    example: 'This document contains the detailed project plan for Q1.',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    description:
      'File path where the document is stored (Accepted file types: .pdf, .docx)',
    example: '/uploads/documents/project-plan.pdf',
  })
  @IsString()
  @IsNotEmpty()
  readonly filePath: string;

  @ApiProperty({
    description: 'The name of the document file (not accept space)',
    example: 'Project_Plan',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[^\s]+$/, {
    message: 'fileName must not contain spaces (optional)',
  })
  readonly fileName?: string;
}

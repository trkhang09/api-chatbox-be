import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'The unique identifier of the document to update',
    example: 'a3f47d52-1e2b-4c8b-9b6a-54f2afc9d123',
  })
  @IsUUID()
  readonly id: string;

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
    description: 'A short description of the document',
    example: 'This document contains the detailed project plan for Q1.',
  })
  @IsString()
  readonly description: string;
}

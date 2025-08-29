import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

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
    description: 'A short description of the document',
    example: 'This document contains the detailed project plan for Q1.',
  })
  @IsString()
  readonly description: string;
}

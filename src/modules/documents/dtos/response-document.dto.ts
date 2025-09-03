import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

export class ResponseDocumentDto {
  @ApiProperty({
    description: 'The uuid of the document',
    example: '6b7b09a3-6f59-421b-909c-4907a51011e8',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the document',
    example: 'Project Plan',
  })
  title: string;

  @ApiProperty({
    description: 'A short description of the document',
    example: 'This document contains the detailed project plan for Q1.',
  })
  description: string;

  @ApiProperty({
    description: 'File path where the document is stored',
    example: '/uploads/documents/project-plan.pdf',
  })
  filePath: string;

  @ApiProperty({
    description: 'Current status of the document.',
    enum: DocumentStatus,
    example: DocumentStatus.ACTIVED,
  })
  status: DocumentStatus;

  @ApiProperty({
    description: 'Size of the file (kB).',
    type: 'number',
    example: 23,
  })
  size: number;
}

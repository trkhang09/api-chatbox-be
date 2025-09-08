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
  s;

  @ApiProperty({
    description: 'Current status of the document.',
    enum: DocumentStatus,
    example: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @ApiProperty({
    description: 'Size of the file (kB).',
    type: 'number',
    example: 23,
  })
  size: number;

  @ApiProperty({
    description: 'Date and time when the document was created',
    type: String,
    format: 'date-time',
    example: '2025-08-27T14:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the document was updated',
    type: String,
    format: 'date-time',
    example: '2025-08-27T14:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The ID of the user who created the document',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
  })
  createdByUserId: string;
}

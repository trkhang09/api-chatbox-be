import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

export class ResponseUpdatedDocumentDto {
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
    description: 'Current status of the document',
    enum: DocumentStatus,
    example: DocumentStatus.ACTIVED,
  })
  status: DocumentStatus;

  @ApiProperty({
    description: 'Date and time when the document was updated',
    type: String,
    format: 'date-time',
    example: '2025-08-27T14:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The ID of the user who updated the document',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
  })
  updatedByUserId: string;
}

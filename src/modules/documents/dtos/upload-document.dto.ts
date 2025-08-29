import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'The name of the document file (not accept space)',
    example: 'Project_Plan',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^\s]+$/, {
    message: 'fileName must not contain spaces',
  })
  @MaxLength(255)
  readonly fileName: string;

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

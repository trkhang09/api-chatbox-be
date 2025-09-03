import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

export class GetPaginatedDocumentsDto extends PaginateDto {
  @ApiPropertyOptional({
    description:
      'Filter documents by their status. ' +
      Object.keys(DocumentStatus)
        .filter((key) => isNaN(Number(key)))
        .map(
          (key) =>
            `${key} = ${DocumentStatus[key as keyof typeof DocumentStatus]}`,
        )
        .join(', '),
    enum: DocumentStatus,
    example: DocumentStatus.ACTIVED,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(DocumentStatus)
  readonly status?: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Search documents by title keyword',
    example: 'Project',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly searchTitleKeyword: string = '';
}

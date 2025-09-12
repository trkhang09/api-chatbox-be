import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { getEnumJoin } from 'src/common/utils/get-enum-join';

export class GetPaginatedDocumentsDto extends PaginateDto {
  @ApiPropertyOptional({
    description:
      'Filter documents by their status. ' + getEnumJoin(DocumentStatus),
    enum: DocumentStatus,
    example: DocumentStatus.PENDING,
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

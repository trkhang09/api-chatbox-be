import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetSettingsDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['key', 'value', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    example: 'key',
  })
  @IsOptional()
  @IsString()
  @IsIn(['key', 'value', 'createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @ApiProperty({
    description: 'Sorting order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    example: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Field to search',
    example: 'value',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetRolesDto extends PaginateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty()
  @IsOptional()
  status?: number | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['name', 'code', 'createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}

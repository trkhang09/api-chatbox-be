import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class RolesRequestDto extends PaginateDto {
  @ApiProperty({
    example: 'Admin',
    description: 'Search term for role name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Status of the role (1: active, 0: inactive)',
  })
  @IsOptional()
  status?: number;

  @ApiProperty({
    example: 'createdAt',
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'code', 'createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @ApiProperty({
    example: 'DESC',
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class PermissionFilterRequestDto extends PaginateDto {
  @ApiProperty({
    description: 'Search term for permission name',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

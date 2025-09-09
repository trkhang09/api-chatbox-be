import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class PermissionFilterRequestDto extends PaginateDto {
  @ApiProperty({
    description: 'Role Code to filter permissions',
  })
  @IsString()
  roleCode: string;
}

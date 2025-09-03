import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class PermissionFilterRequestDto extends PaginateDto {
  @ApiProperty({
    description: 'Role ID to filter permissions',
  })
  @IsUUID()
  roleId: string;
}

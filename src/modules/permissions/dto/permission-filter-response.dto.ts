import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PermissionFilterResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the permission',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'View Users',
    description: 'Name of the permission',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'view_users',
    description: 'Code of the permission',
  })
  code: string;
}

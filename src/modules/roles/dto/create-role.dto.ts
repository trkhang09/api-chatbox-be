import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Super Admin', description: 'Name of the role' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'SUPER_ADMIN',
    description: 'Unique identifier for the role',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: ['uuid-permission-1', 'uuid-permission-2'],
    description: 'List of permission IDs (optional)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}

import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'Super Admin',
    description: 'Name of the new role',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'SUPER_ADMIN',
    description: 'Unique identifier for the new role',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: ['uuid-permission-1', 'uuid-permission-2'],
    description: 'List of permission IDs (optional)',
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

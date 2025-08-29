import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleRequestDto {
  @ApiProperty({ example: 'Super Admin', description: 'Name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'SUPER_ADMIN',
    description: 'Unique identifier for the role',
  })
  @IsString()
  @IsNotEmpty()
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

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionResponseDto } from 'src/modules/permissions/dto/permission-response.dto';

export class RoleResponseDto {
  @Expose()
  @ApiProperty({
    example: 'uuid-role-1',
    description: 'Unique identifier for the role',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @ApiProperty({ example: 'Super Admin', description: 'Name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @ApiProperty({
    example: 'SUPER_ADMIN',
    description: 'Unique identifier for the role',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Status of the role (1: active, 0: inactive)',
  })
  status: number;

  @Expose()
  @ApiProperty({
    example: ['uuid-permission-1', 'uuid-permission-2'],
    description: 'List of permission IDs (optional)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Type(() => PermissionResponseDto)
  permissions?: PermissionResponseDto[];
}

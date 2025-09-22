import { IsArray, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { Transform, Type } from 'class-transformer';

export class GetUsersDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Search by user fullname or email',
    example: 'john.doe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by user status, can pass multiple statuses',
    isArray: true,
    enum: UserStatus,
    example: [UserStatus.ACTIVED, UserStatus.BLOCKED],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const arr = value.split(',').filter((v) => v !== '');
      return arr.length > 0 ? arr : undefined;
    }
    if (Array.isArray(value)) {
      const arr = value
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => v && v !== '');
      return arr.length > 0 ? arr : undefined;
    }
    return undefined;
  })
  status?: string[];

  @ApiPropertyOptional({
    description: 'Filter by user roles',
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const arr = value.split(',').filter((v) => v !== '');
      return arr.length > 0 ? arr : undefined;
    }
    if (Array.isArray(value)) {
      const arr = value
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => v && v !== '');
      return arr.length > 0 ? arr : undefined;
    }
    return undefined;
  })
  role?: string[];
}

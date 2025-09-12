import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { getEnumJoin } from 'src/common/utils/get-enum-join';
import { Type } from 'class-transformer';

export class GetUsersDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Search by user fullname or email',
    example: 'john.doe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by user status, ' + getEnumJoin(UserStatus),
    enum: UserStatus,
    example: UserStatus.ACTIVED,
  })
  @Type(() => Number)
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['fullname', 'email', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    example: 'fullname',
  })
  @IsOptional()
  @IsString()
  @IsIn(['fullname', 'email', 'createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @ApiProperty({
    description: 'Sorting order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    example: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}

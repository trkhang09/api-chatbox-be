import {
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { IsNull } from 'typeorm';

export class GetUsersDto extends PaginateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty()
  @IsOptional()
  status?: number | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['fullname', 'email', 'createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}

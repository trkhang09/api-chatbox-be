import {
  IsEmail,
  IsIn,
  IsInt,
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

export class GetUsersDto extends PaginateDto {
  @ApiProperty()
  @IsOptional()
  roleIds?: string[];

  // @IsOptional()
  // @IsString()
  // fullname?: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // @IsEmail()
  // email?: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

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

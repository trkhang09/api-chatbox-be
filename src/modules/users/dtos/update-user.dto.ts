import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { Type } from 'class-transformer';
import { getEnumJoin } from 'src/common/utils/get-enum-join';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsUUID(4)
  readonly userId: string;

  @ApiPropertyOptional({
    description: 'Status of the user: ' + getEnumJoin(UserStatus),
    enum: UserStatus,
    example: UserStatus.ACTIVED,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(UserStatus)
  readonly status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(50)
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Password of the user (max length 50)',
    example: 'StrongPassw0rd!',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly password?: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly fullname?: string;

  @ApiPropertyOptional({
    description: 'Role assigned to the user',
    example: 'b4200f12-46c1-47d0-9a6a-2f2cb3c5732d',
  })
  @IsOptional()
  @IsUUID(4)
  readonly roleId?: string;
}

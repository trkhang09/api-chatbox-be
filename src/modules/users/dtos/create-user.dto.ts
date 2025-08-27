import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @MaxLength(50)
  email: string;

  @ApiProperty()
  @MaxLength(50)
  password: string;

  @ApiProperty()
  @MaxLength(100)
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsString()
  roleId: string;
}

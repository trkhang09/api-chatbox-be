import { IsEmail, IsString, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends CreateUserDto {
  @ApiProperty()
  @IsString()
  userId: string;
}

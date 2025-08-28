import {
  IsEmail,
  IsIn,
  IsNotIn,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class UpdateUserDto extends CreateUserDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNumber()
  @IsIn(Object.values(UserStatus), { message: 'status invalid' })
  status: number;
}

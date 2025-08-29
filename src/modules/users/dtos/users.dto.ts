import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { User } from '../entities/user.entity';

export class UsersDto {
  @ApiProperty({ type: () => UserDto, isArray: true })
  items: User[] = [];
}

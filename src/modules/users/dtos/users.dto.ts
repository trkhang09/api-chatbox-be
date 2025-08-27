import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UsersDto {
  @ApiProperty({ type: () => UserDto, isArray: true })
  items: UserDto[] = [];
  @ApiProperty()
  limit: Number;
  @ApiProperty()
  currentPage: Number;
  @ApiProperty()
  totalPage: Number;
}

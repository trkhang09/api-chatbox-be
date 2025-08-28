import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from 'src/modules/roles/entities/role.entity';

export class UserDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  fullname: string;

  @Expose()
  @ApiProperty()
  role: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  createdByUserId: string;
}

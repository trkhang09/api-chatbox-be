import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { User } from '../entities/user.entity';
import { RoleFilterResponseDto } from 'src/modules/roles/dto/role-filter-response.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { getEnumJoin } from 'src/common/utils/get-enum-join';

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the user (UUID)',
    example: '6bb3e02e-52aa-4a3c-ac3d-8ee305bfe41f',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'johndoe@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullname: string;

  @Expose()
  @ApiProperty({
    description: 'Role assigned to the user',
    type: () => RoleFilterResponseDto,
    required: false,
  })
  role?: RoleFilterResponseDto;

  @Expose()
  @ApiProperty({
    description: 'Date when the user was created',
    example: '2025-09-12T08:30:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2025-09-12T10:15:00.000Z',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    description: 'ID of the user who created this user (UUID)',
    example: '2aa3b2de-1a45-4934-8e90-445f9fa23d9a',
  })
  createdByUserId: string;

  @Expose()
  @ApiProperty({
    description: 'Status of the user, ' + getEnumJoin(UserStatus),
    example: 1,
  })
  status: UserStatus;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

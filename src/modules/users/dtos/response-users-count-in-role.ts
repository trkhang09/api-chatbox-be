import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/modules/roles/entities/role.entity';

export class ResponseUsersCountInRole {
  @ApiProperty({
    description: 'The role name',
    example: 'Admin',
  })
  role: string;

  @ApiProperty({
    description: 'Number of users assigned to this role',
    example: 42,
  })
  usersCount: number;

  constructor(role: Role, usersCount?: number) {
    this.role = role.name;
    this.usersCount = usersCount ?? role.users?.length ?? 0;
  }
}

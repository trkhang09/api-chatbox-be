import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({
    example: 'a2583657-f46c-4cbe-93cd-4a5d5816c4bd',
    description: 'Unique user ID',
  })
  sub: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  fullname: string;

  @ApiProperty({ example: 'id user', description: 'Id of the Role' })
  roleId: string;

  @ApiProperty({ example: 'Admin', description: 'Name of the Role' })
  roleName: string;

  @ApiProperty({
    example: 173463534,
    description: 'Issued At (Unix timestamp in seconds)',
  })
  iat: number;

  @ApiProperty({
    example: 173463534,
    description: 'Expiration Time (Unix timestamp in seconds)',
  })
  exp: number;
}

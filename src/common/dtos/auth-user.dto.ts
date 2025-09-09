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

  @ApiProperty({ example: 'user', description: 'Role of the user' })
  role: string;

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

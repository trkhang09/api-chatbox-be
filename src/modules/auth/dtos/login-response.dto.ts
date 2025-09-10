import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123', description: 'Unique user ID' })
  userId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  fullname: string;

  @ApiProperty({
    example: 'd76a90d8-4909-4740-b559-5216a18d27ca',
    description: 'UUID of the role',
  })
  roleId: string;

  @ApiProperty({ example: 'Admin', description: 'Role name of the user' })
  roleName: string;
}

export class TokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: TokensResponseDto })
  tokens: TokensResponseDto;
}

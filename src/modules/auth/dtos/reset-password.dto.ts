import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @ApiProperty({
    description: 'Verification code sent to the user (e.g., via email or SMS)',
    example: '123456',
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code must not be empty' })
  code: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'StrongPassword123',
    minLength: 6,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'New password must not be empty' })
  newPassword: string;
}

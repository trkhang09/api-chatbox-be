import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Old password',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty({ message: 'Old password must not be empty' })
  oldPassword: string;

  @ApiProperty({
    description: 'New password',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password must not be empty' })
  newPassword: string;
}

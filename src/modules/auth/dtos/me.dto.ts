import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty({
    example: 'a2583657-f46c-4cbe-93cd-4a5d5816c4bd',
    description: 'Unique user ID',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  fullname: string;

  @ApiProperty({ example: 'user', description: 'Role of the user' })
  role: string;
}

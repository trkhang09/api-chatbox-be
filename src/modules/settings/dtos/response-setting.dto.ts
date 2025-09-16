import { ApiProperty } from '@nestjs/swagger';

export class ResponseSettingDto {
  @ApiProperty({
    description: 'id setting',
  })
  id: string;

  @ApiProperty({
    description: 'key setting',
  })
  key: string;

  @ApiProperty({
    description: 'value setting',
  })
  value: string;

  @ApiProperty({
    description: 'type setting',
  })
  type: string;

  @ApiProperty({
    description: 'description setting',
  })
  description: string;
}

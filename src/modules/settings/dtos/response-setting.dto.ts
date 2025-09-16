import { ApiProperty } from '@nestjs/swagger';

export class ResponseSettingDto {
  @ApiProperty({
    description: 'id setting',
  })
  readonly id: string;

  @ApiProperty({
    description: 'key setting',
  })
  readonly key: string;

  @ApiProperty({
    description: 'value setting',
  })
  readonly value: string;

  @ApiProperty({
    description: 'type setting',
  })
  readonly type: string;

  @ApiProperty({
    description: 'description setting',
  })
  readonly description: string;
}

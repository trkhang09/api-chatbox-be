import { ApiProperty } from '@nestjs/swagger';

export class ResponseSettingDto {
  @ApiProperty({
    description: 'ID of the setting',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Key of the setting',
    example: 'maxTokens',
  })
  readonly key: string;

  @ApiProperty({
    description: 'Value of the setting',
    example: '512',
  })
  readonly value: string;

  @ApiProperty({
    description: 'Type of the setting',
    example: 'number',
  })
  readonly type: string;

  @ApiProperty({
    description: 'Description of the setting',
    example: 'Maximum number of tokens allowed per request',
  })
  readonly description: string;

  @ApiProperty({
    description: 'Last updated timestamp',
    type: String,
    format: 'date-time',
    example: '2025-09-18T12:34:56.000Z',
  })
  readonly updatedAt: Date;
}

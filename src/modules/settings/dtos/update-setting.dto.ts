import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TypeSettings } from 'src/common/enums/type-settings.enum';

export class UpdateSettingDto {
  @ApiProperty({ example: 'site_name', description: 'The key of the setting' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 'My Awesome Site',
    description: 'The value of the setting',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    example: TypeSettings.STRING,
    description: 'The type of the setting',
    enum: TypeSettings,
  })
  @IsNotEmpty()
  @IsIn(Object.values(TypeSettings), { message: 'type invalid' })
  type: TypeSettings;

  @ApiProperty({
    example: 'The site name',
    description: 'The description of the setting',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

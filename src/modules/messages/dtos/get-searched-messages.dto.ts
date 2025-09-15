import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class GetSearchedMessagesDto {
  @ApiPropertyOptional({
    description: 'The keyword that is to retrieve messages match with it',
    example: 'Hello',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string;

  @ApiProperty({
    description: 'The number of items want to take (must be positive)',
    example: 60,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly size: number = 60;
}

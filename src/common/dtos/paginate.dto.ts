import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class PaginateDto {
  @ApiProperty({
    description: 'The page number to retrieve (must be positive)',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly page: number;

  @ApiProperty({
    description: 'The number of items per page (must be positive)',
    example: 20,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly size: number;
}

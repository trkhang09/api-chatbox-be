import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginateDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly size: number = 10;
}

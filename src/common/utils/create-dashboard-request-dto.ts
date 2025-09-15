import { IsEnum, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export function createDashboardRequestDto<
  TEnum extends Record<string, number | string>,
>(EnumType: TEnum) {
  class DashboardRequestDto {
    @Type(() => Number)
    @IsEnum(EnumType)
    @IsPositive()
    readonly status: number;

    @Type(() => Number)
    @IsPositive()
    @Max(90)
    readonly days: number;
  }

  return DashboardRequestDto;
}

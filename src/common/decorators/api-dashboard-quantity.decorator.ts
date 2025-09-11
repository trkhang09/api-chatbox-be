import { applyDecorators, Get } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator'; // your custom response
import { getEnumJoin } from '../utils/get-enum-join';
import { ApiForbiddenResponseCustom } from './api-forbidden-response.decorator';
import { isNumber } from 'class-validator';

export function ApiDashboardQuantity(
  EnumType: Record<string, number | string>,
) {
  return applyDecorators(
    Get('/quantity'),
    ApiOperation({
      summary: 'Get quatity with status/type within s specifi days',
    }),
    ApiQuery({
      name: 'status',
      enum: Object.values(EnumType).filter((v) => isNumber(v)),
      description: 'Status value, must be one of: ' + getEnumJoin(EnumType),
      example: Object.values(EnumType)[0],
    }),
    ApiQuery({
      name: 'days',
      type: Number,
      description: 'Number of days (max 90)',
      minimum: 1,
      maximum: 90,
      example: 30,
    }),
    ApiCommonResponseCustom(Number, 100),
    ApiForbiddenResponseCustom(),
  );
}

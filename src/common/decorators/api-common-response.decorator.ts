import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';
import { ApiBadRequestResponseCustom } from './api-bad-request-response.decorator';
import { ApiInternalServerErrorResponseCustom } from './api-internal-server-error-response.decorator';
import { ApiOkResponseCustom } from './api-ok-response.decorator';

export const ApiCommonResponseCustom = <GenericType extends Type<unknown>>(
  data: GenericType,
  typeOrExample: 'array' | 'object' | any = 'object',
) =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto, data),
    ApiOkResponseCustom(data, typeOrExample),
    ApiBadRequestResponseCustom(),
    ApiInternalServerErrorResponseCustom(),
  );

import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';
import { ApiBadRequestResponseCustom } from './api-bad-request-response.decorator';
import { ApiInternalServerErrorResponseCustom } from './api-internal-server-error-response.decorator';

export const ApiCommonErrorResponseCustom = () =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto),
    ApiInternalServerErrorResponseCustom(),
    ApiBadRequestResponseCustom(),
  );

import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ApiInternalServerErrorResponseCustom = () =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto),
    ApiInternalServerErrorResponse({
      description: 'Internal error in server occured',
      type: GetHttpResponseDto,
    }),
  );

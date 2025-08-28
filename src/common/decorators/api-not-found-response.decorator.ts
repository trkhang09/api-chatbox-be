import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiExtraModels } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ApiNotFoundResponseCustom = () =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto),
    ApiNotFoundResponse({
      description: 'There is no data to return',
      type: GetHttpResponseDto,
    }),
  );

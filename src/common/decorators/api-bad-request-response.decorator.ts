import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ApiBadRequestResponseCustom = () =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto),
    ApiBadRequestResponse({
      description: 'Validation failed',
      type: GetHttpResponseDto,
    }),
  );

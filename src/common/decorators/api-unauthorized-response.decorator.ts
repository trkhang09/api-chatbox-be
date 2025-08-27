import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse, ApiExtraModels } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ApiUnauthorizedResponseCustom = () =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto),
    ApiUnauthorizedResponse({
      description: "This user doesn't have permissions to access this request",
      type: GetHttpResponseDto,
    }),
  );

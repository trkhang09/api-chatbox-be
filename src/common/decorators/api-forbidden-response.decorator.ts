import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiForbiddenResponse } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ApiForbiddenResponseCustom = () =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto),
    ApiForbiddenResponse({
      description: "This user doesn't have permissions to access this request",
      type: GetHttpResponseDto,
    }),
  );

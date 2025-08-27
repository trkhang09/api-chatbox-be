import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ApiOkResponseCustom = <GenericType extends Type<unknown>>(
  data: GenericType,
) =>
  applyDecorators(
    ApiExtraModels(GetHttpResponseDto, data),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(GetHttpResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(data) },
              },
            },
          },
        ],
      },
    }),
  );

import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const ApiPaginatedResponseCustom = <
  GenericType extends Type<unknown>,
  PaginatedType extends Type<unknown>,
>(
  data: GenericType,
  paginatedData: PaginatedType,
) => {
  const schemaObj: SchemaObject = {
    type: 'object',
    properties: {
      data: {
        allOf: [
          { $ref: getSchemaPath(data) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(paginatedData) },
              },
            },
          },
        ],
      },
    },
  };

  return applyDecorators(
    ApiExtraModels(GetHttpResponseDto, data, paginatedData),
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(GetHttpResponseDto) }, schemaObj],
      },
    }),
  );
};

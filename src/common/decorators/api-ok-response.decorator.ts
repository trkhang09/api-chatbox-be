import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const ApiOkResponseCustom = <GenericType extends Type<unknown>>(
  data: GenericType,
  typeOrExample: 'array' | 'object' | any = 'object',
) => {
  const schemaObjForTypeArray: SchemaObject = {
    properties: {
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(data) },
      },
    },
  };

  const schemaObjForTypeObject: SchemaObject = {
    type: 'object',
    properties: {
      data: {
        $ref: getSchemaPath(data),
      },
    },
  };

  const schemaObjForBuildInType: SchemaObject = {
    type: 'object',
    properties: {
      data: {
        example: typeOrExample,
      },
    },
  };

  let schemaObj: SchemaObject;

  switch (typeOrExample) {
    case 'object':
      schemaObj = schemaObjForTypeObject;
      break;
    case 'array':
      schemaObj = schemaObjForTypeArray;
      break;
    default:
      schemaObj = schemaObjForBuildInType;
  }

  return applyDecorators(
    ApiExtraModels(GetHttpResponseDto, data),
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(GetHttpResponseDto) }, schemaObj],
      },
    }),
  );
};

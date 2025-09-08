import { applyDecorators, SetMetadata } from '@nestjs/common';
import { RoleType } from '../../common/constants/role-constants';
import { ApiUnauthorizedResponse, ApiExtraModels } from '@nestjs/swagger';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiExtraModels(GetHttpResponseDto),
    ApiUnauthorizedResponse({
      description: "This user doesn't have permissions to access this request",
      type: GetHttpResponseDto,
    }),
  );

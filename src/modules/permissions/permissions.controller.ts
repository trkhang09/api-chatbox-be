import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionFilterResponseDto } from './dto/permission-filter-response.dto';
import { PermissionFilterRequestDto } from './dto/permission-filter-request.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';

@Controller('permissions')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
export class PermissionsController {}

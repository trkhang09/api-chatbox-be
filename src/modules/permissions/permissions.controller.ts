import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  Param,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionFilterResponseDto } from './dto/permission-filter-response.dto';
import { PermissionFilterRequestDto } from './dto/permission-filter-request.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';

@Controller('permissions')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @ApiCommonResponseCustom(PermissionFilterResponseDto)
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll() {
    return this.permissionsService.findAll();
  }

  @ApiCommonResponseCustom(PermissionFilterResponseDto)
  @Get('by-role/:roleId')
  async findPermissionByRoleId(@Param() param: PermissionFilterRequestDto) {
    return this.permissionsService.findPermissionsByRoleId(param);
  }
}

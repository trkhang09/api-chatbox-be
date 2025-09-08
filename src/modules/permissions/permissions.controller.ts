import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiResponse } from '@nestjs/swagger';
import { PermissionFilterResponseDto } from './dto/permission-filter-response.dto';
import { PermissionFilterRequestDto } from './dto/permission-filter-request.dto';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleType } from 'src/common/constants/role-constants';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';

@Controller('permissions')
@UseGuards(RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @ApiCommonResponseCustom(PermissionFilterResponseDto)
  @Get()
  @Roles(RoleType.SUPER_ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  findAll() {
    return this.permissionsService.findAll();
  }

  @ApiCommonResponseCustom(PermissionFilterResponseDto)
  @Get('by-role/:roleId')
  @Roles(RoleType.SUPER_ADMIN)
  async findPermissionByRoleId(@Param() param: PermissionFilterRequestDto) {
    return this.permissionsService.findPermissionByRoleId(param);
  }
}

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
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiResponse } from '@nestjs/swagger';
import { PermissionFilterResponseDto } from './dto/permission-filter-response.dto';
import { PermissionFilterRequestDto } from './dto/permission-filter-request.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of permissions',
    type: PermissionFilterResponseDto,
  })
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll() {
    return this.permissionsService.findAll();
  }
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of permissions for a specific role',
    type: PermissionFilterResponseDto,
  })
  @Get('by-role/:roleId')
  async findPermissionByRoleId(@Param() param: PermissionFilterRequestDto) {
    return this.permissionsService.findPermissionByRoleId(param);
  }
}

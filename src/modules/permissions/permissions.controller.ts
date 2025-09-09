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
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @ApiCommonResponseCustom(PermissionFilterResponseDto)
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll() {
    return this.permissionsService.findAll();
  }

  @ApiCommonResponseCustom(PermissionFilterResponseDto)
  @Get('by-role-code')
  async findPermissionByRoleId(@Query() query: PermissionFilterRequestDto) {
    return this.permissionsService.findPermissionsByRoleCode(query);
  }
}

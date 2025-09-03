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
  findAll(@Query() query: PermissionFilterRequestDto) {
    return this.permissionsService.findAll(query);
  }
}

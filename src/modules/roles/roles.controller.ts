import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  Query,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
import { RolesRequestDto } from './dto/roles-request.dto';
import { Role } from './entities/role.entity';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of roles',
    type: ResponsePaginateDto<Role>,
  })
  @Get('list')
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query() query: RolesRequestDto) {
    return this.rolesService.findAll(query);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get a specific role',
    type: Role,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create a new role',
    type: Role,
  })
  @Post()
  create(@Body() dto: CreateRoleRequestDto, @Req() req) {
    const userId = req['user'].sub;
    return this.rolesService.create(dto, userId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update a role',
    type: Role,
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleRequestDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Remove a role',
    type: Boolean,
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}

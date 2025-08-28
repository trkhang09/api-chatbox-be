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
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  findAll(@Query('status') status: number) {
    return this.rolesService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific role' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() dto: CreateRoleRequestDto, @Req() req) {
    const userId = req['user'].sub;
    return this.rolesService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a role' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleRequestDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a role' })
  remove(@Param('id') id: string, @Req() req) {
    const userId = req['user'].sub;
    return this.rolesService.remove(id, userId);
  }
}

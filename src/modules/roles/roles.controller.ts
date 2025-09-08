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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
import { RoleFilterRequestDto } from './dto/role-filter-request.dto';
import { Role } from './entities/role.entity';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { ApiOkResponseCustom } from 'src/common/decorators/api-ok-response.decorator';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleType } from 'src/common/constants/role-constants';

@Controller('roles')
@UseGuards(RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get list of roles',
  })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, Role)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  findAll(@Query() query: RoleFilterRequestDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get a specific role',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the role which will be removed',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiOkResponseCustom(Boolean, true)
  @ApiNotFoundResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create a new role',
  })
  @ApiCommonResponseCustom(Role)
  create(@Body() dto: CreateRoleRequestDto, @Req() req) {
    const userId = req['user'].sub;
    return this.rolesService.create(dto, userId);
  }

  @Put(':id')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update a role',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the role which will be updated',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiCommonResponseCustom(Role)
  @ApiNotFoundResponseCustom()
  update(@Param('id') id: string, @Body() dto: UpdateRoleRequestDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Remove a role',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the role which will be removed',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiOkResponseCustom(Boolean, true)
  @ApiNotFoundResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}

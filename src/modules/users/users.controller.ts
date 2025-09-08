import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { UserDto } from './dtos/user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { UsersDto } from './dtos/users.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { RoleType } from 'src/common/constants/role-constants';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create new user',
  })
  @ApiCommonResponseCustom(UserDto)
  async createNewUser(
    @Body() createUserDto: CreateUserDto,
    @AuthUser('sub') userId: string,
  ) {
    return await this.usersService.createNewUser(createUserDto, userId);
  }

  @Put('update')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update a specific user',
  })
  @ApiCommonResponseCustom(UserDto)
  @ApiNotFoundResponseCustom()
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(updateUserDto);
  }

  @Delete(':userId')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user who will be removed',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiCommonResponseCustom(Boolean, true)
  @ApiNotFoundResponseCustom()
  async deleteSoftUser(@Param('userId') userId: string) {
    return await this.usersService.deleteSoftSUser(userId);
  }

  @Put(':userId/restore')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Restore a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user who will be restored',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiCommonResponseCustom(Boolean, true)
  @ApiNotFoundResponseCustom()
  async restoreUser(@Param('userId') userId: string) {
    return await this.usersService.restoreUser(userId);
  }

  @Get('list')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get list of users',
  })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, UserDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponse()
  async listUsers(@Query() query: GetUsersDto) {
    return this.usersService.getListUsers(query);
  }

  @Get(':userId')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get detailed information of a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user who will be restored',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiCommonResponseCustom(UserDto)
  @ApiNotFoundResponseCustom()
  async getUserDetail(@Param('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }
}

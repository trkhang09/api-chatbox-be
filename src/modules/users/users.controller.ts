import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DashboardForUserRequestDto, UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { UserDto } from './dtos/user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionType } from 'src/common/constants/permission-constants';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { ApiDashboardQuantity } from 'src/common/decorators/api-dashboard-quantity.decorator';

@Controller('users')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiDashboardQuantity(UserStatus)
  async getQuantity(
    @Query() query: InstanceType<typeof DashboardForUserRequestDto>,
  ) {
    return this.usersService.getQuantity(query);
  }

  @Post('create')
  @Permissions(PermissionType.USER_CREATE)
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
  @Permissions(PermissionType.USER_UPDATE)
  @ApiOperation({
    summary: 'Update a specific user',
  })
  @ApiCommonResponseCustom(UserDto)
  @ApiNotFoundResponseCustom()
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(updateUserDto);
  }

  @Delete(':userId')
  @Permissions(PermissionType.USER_DELETE)
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
  @Permissions(PermissionType.USER_RESTORE)
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
  @Permissions(PermissionType.USER_GET)
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
  @Permissions(PermissionType.USER_GET)
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

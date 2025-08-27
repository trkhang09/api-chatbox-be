import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dtos/user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { UsersDto } from './dtos/users.dto';
import { UserDetailDto } from './dtos/user-detail.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'create user sucess',
    type: UserDto,
  })
  @Post('create')
  async createNewUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ) {
    const createdBy = req['user'].sub;
    return await this.usersService.createNewUser(createUserDto, createdBy);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'update user sucess',
    type: UserDto,
  })
  @Put('update')
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(updateUserDto);
  }

  @ApiProperty()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'delete user sucess',
    type: Boolean,
  })
  @Delete(':userId')
  async deleteSoftUser(@Param('userId') userId: string) {
    return await this.usersService.deleteSoftSUser(userId);
  }

  @ApiProperty()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'restore user sucess',
    type: Boolean,
  })
  @Put(':userId/restore')
  async restoreUser(@Param('userId') userId: string) {
    return await this.usersService.restoreUser(userId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'all list users',
    type: UsersDto,
  })
  @Get('list')
  async listUsers(@Query() query: GetUsersDto) {
    return this.usersService.getListUsers(query);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'user detail',
    type: UserDetailDto,
  })
  @Get(':userId')
  async getUserDetail(@Param('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @ApiProperty()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'reset password user',
    type: Boolean,
  })
  @Put(':userId/reset-password')
  async resetPassword(@Param('userId') userId: string) {
    return this.usersService.resetPassword(userId);
  }
}

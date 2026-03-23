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
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
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
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
// import { CreateUserDto } from './dtos/create-user.dto';
// import { UpdateUserDto } from './dtos/update-user.dto';
// import { UserDto } from './dtos/user.dto';
// import { GetUsersDto } from './dtos/get-users.dto';
// import { GetUsersForChatDto } from './dtos/get-users-for-chat.dto';

@Controller('users')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}

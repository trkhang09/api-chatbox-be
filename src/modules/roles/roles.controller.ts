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
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { RolesService } from './roles.service';
// import { CreateRoleRequestDto } from './dto/create-role-request.dto';
// import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
// import { RoleFilterRequestDto } from './dto/role-filter-request.dto';
import { Role } from './entities/role.entity';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { ApiOkResponseCustom } from 'src/common/decorators/api-ok-response.decorator';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionType } from 'src/common/constants/permission-constants';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
import { ResponseUsersCountInRole } from '../users/dtos/response-users-count-in-role';

@Controller('roles')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
@UseGuards(PermissionGuard)
export class RolesController {}

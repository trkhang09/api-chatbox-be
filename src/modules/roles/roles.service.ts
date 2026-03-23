import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
// import { CreateRoleRequestDto } from './dto/create-role-request.dto';
// import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
// import { RoleFilterRequestDto } from './dto/role-filter-request.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { plainToInstance } from 'class-transformer';
// import { RoleFilterResponseDto } from './dto/role-filter-response.dto';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
import { RoleType } from 'src/common/constants/role-constants';
import { ResponseUsersCountInRole } from '../users/dtos/response-users-count-in-role';

@Injectable()
export class RolesService {}

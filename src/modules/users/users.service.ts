import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import bcrypt from 'bcrypt';
import { MoreThanOrEqual } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { RoleRepository } from '../roles/role.repository';
import { plainToInstance } from 'class-transformer';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { createDashboardRequestDto } from 'src/common/utils/create-dashboard-request-dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { validateDashboardRequest } from 'src/common/utils/validate-dashboard-request';
import { RoleType } from 'src/common/constants/role-constants';
// import { CreateUserDto } from './dtos/create-user.dto';
// import { UpdateUserDto } from './dtos/update-user.dto';
// import { UserDto } from './dtos/user.dto';
// import { GetUsersDto } from './dtos/get-users.dto';
// import { RoleFilterResponseDto } from '../roles/dto/role-filter-response.dto';
// import { GetUsersForChatDto } from './dtos/get-users-for-chat.dto';
// import { RespondUserForChatDto } from './dtos/respond-users-for-chat.dto';
export const DashboardForUserRequestDto = createDashboardRequestDto(UserStatus);

@Injectable()
export class UsersService {
  constructor(
    // @InjectRepository(User)
    private usersRepository: UsersRepository,
    @InjectRepository(Role)
    private readonly roleRepository: RoleRepository,
  ) {}
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import bcrypt from 'bcrypt';
import { FindOptionsWhere, ILike, MoreThanOrEqual, Not } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { RoleRepository } from '../roles/role.repository';
import { plainToInstance } from 'class-transformer';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { createDashboardRequestDto } from 'src/common/utils/create-dashboard-request-dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { validateDashboardRequest } from 'src/common/utils/validate-dashboard-request';
import { RoleType } from 'src/common/constants/role-constants';
import { RoleFilterResponseDto } from '../roles/dto/role-filter-response.dto';
export const DashboardForUserRequestDto = createDashboardRequestDto(UserStatus);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: UsersRepository,
    @InjectRepository(Role)
    private readonly roleRepository: RoleRepository,
  ) {}

  /**
   * get quantity with a specific status/type within a number of days
   */
  async getQuantity(
    query: InstanceType<typeof DashboardForUserRequestDto>,
  ): Promise<number> {
    try {
      const payload = validateDashboardRequest(query, UserStatus);
      let where: any = {};
      where.status = payload.status;
      console.log(payload);

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - payload.days);
      where.createdAt = MoreThanOrEqual(fromDate);

      const quantity = await this.usersRepository.count({ where });
      return quantity;
    } catch (error) {
      throw new Error('Failed to get quantity: ' + error.message);
    }
  }

  /**
   * create new user
   * @returns Promise<UserDto>
   * @throws NotFoundException
   * @throws BadRequestException
   * @throws InternalServerErrorException
   */
  async createNewUser(
    createUserDto: CreateUserDto,
    createdBy: string,
  ): Promise<UserDto> {
    try {
      const [userFound, roleFound, hashPassword] = await Promise.all([
        this.usersRepository.exists({
          where: { email: createUserDto.email },
        }),
        this.roleRepository.findOne({
          where: { id: createUserDto.roleId },
        }),
        UsersService.generateHashPassword(createUserDto.password),
      ]);

      if (userFound) {
        throw new BadRequestException('Email is already used');
      }

      if (!roleFound) {
        throw new NotFoundException('Role not found');
      }

      if (roleFound.code === RoleType.SUPER_ADMIN) {
        throw new BadRequestException(
          'Cannot create user with role SUPER ADMIN',
        );
      }

      const userStore = await this.usersRepository.save({
        fullname: createUserDto.fullname,
        email: createUserDto.email,
        password: hashPassword,
        role: roleFound,
        createdByUserId: createdBy,
      });

      return plainToInstance(
        UserDto,
        {
          ...userStore,
          role: roleFound.code,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot create a new user with email = \`${createUserDto.email}\`, ${error.message}`,
      );
    }
  }

  /**
   * update a user
   * @returns Promise<UserDto>
   * @throws NotFoundException
   * @throws BadRequestException
   * @throws InternalServerErrorException
   */
  async updateUser(updateUserDto: UpdateUserDto): Promise<UserDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: updateUserDto.userId },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role.code === RoleType.SUPER_ADMIN) {
        throw new BadRequestException(
          'Cannot update user with role SUPER ADMIN',
        );
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const emailExisted = await this.usersRepository.exists({
          where: { email: updateUserDto.email },
        });

        if (emailExisted) {
          throw new BadRequestException('Email is already used');
        }

        user.email = updateUserDto.email;
      }

      if (updateUserDto.roleId && updateUserDto.roleId !== user.role.id) {
        const roleFound = await this.roleRepository.findOne({
          where: { id: updateUserDto.roleId },
        });

        if (!roleFound) {
          throw new NotFoundException('Role not found');
        }

        user.role = roleFound;
      }

      if (updateUserDto.password) {
        user.password = await UsersService.generateHashPassword(
          updateUserDto.password,
        );
      }

      if (updateUserDto.fullname) {
        user.fullname = updateUserDto.fullname;
      }

      if (updateUserDto.status != undefined) {
        user.status = updateUserDto.status;
      }

      const userUpdated = await this.usersRepository.save(user);

      return plainToInstance(
        UserDto,
        {
          ...userUpdated,
          role: userUpdated.role.code,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot update a user with id = \`${updateUserDto.userId}\`, ${error.message}`,
      );
    }
  }

  /**
   * softly delete a user
   * @return Promise<boolean>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async softDeleteUser(id: string): Promise<boolean> {
    try {
      const userFound = await this.usersRepository.findOne({
        where: { id },
        relations: ['role'],
      });

      if (!userFound) {
        throw new NotFoundException(
          'user is deleted or not found, try again later',
        );
      }

      if (userFound.role.code === RoleType.SUPER_ADMIN) {
        throw new BadRequestException(
          'Cannot delete user with role SUPER ADMIN',
        );
      }

      await this.usersRepository.softDelete(userFound.id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot softly delete a user with id = \`${id}\`, ${error.message}`,
      );
    }
  }

  /**
   * get list of users
   * @returns Promise<ResponsePaginateDto<UserDto>>
   */
  async getListUsers(
    getUsersDto: GetUsersDto,
  ): Promise<ResponsePaginateDto<UserDto>> {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.code != :superAdmin', { superAdmin: RoleType.SUPER_ADMIN });

    if (getUsersDto?.search) {
      qb.andWhere('(user.fullname ILIKE :search OR user.email ILIKE :search)', {
        search: `%${getUsersDto.search}%`,
      });
    }

    if (getUsersDto?.status !== undefined && getUsersDto?.status !== null) {
      qb.andWhere('user.status = :status', { status: getUsersDto.status });
    }

    qb.orderBy('user.updatedAt', 'DESC')
      .skip((getUsersDto.page - 1) * getUsersDto.size)
      .take(getUsersDto.size);

    const [users, total] = await qb.getManyAndCount();

    const data: UserDto[] = [];

    users.forEach((user) => {
      const dto = new UserDto({});

      Object.keys(dto).forEach((k) => {
        dto[k] = user[k];
      });

      if (user.role) {
        dto.role = new RoleFilterResponseDto();

        Object.keys(dto.role).forEach((k) => {
          if (dto.role) {
            dto.role[k] = user.role[k];
          }
        });
      } else {
        dto.role = undefined;
      }

      data.push(dto);
    });

    return {
      data,
      size: getUsersDto.size,
      page: getUsersDto.page,
      total: total,
      totalInPage: data.length,
      totalPage: Math.ceil(total / getUsersDto.size),
    };
  }

  /**
   * get user by id
   * @returns Promise<UserDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async getUserById(id: string): Promise<UserDto> {
    let foundUser: User | null;
    try {
      foundUser = await this.usersRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot get user with id = \`${id}\`, ${error.message}`,
      );
    }

    if (!foundUser) {
      throw new NotFoundException('user not found');
    }

    const dto = new UserDto({});

    Object.keys(dto).forEach((k) => {
      dto[k] = foundUser[k];
    });

    return dto;
  }

  /**
   * restore user by id
   * @returns Promise<boolean>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async restoreUser(id: string): Promise<boolean> {
    let foundUser: User | null;
    try {
      foundUser = await this.usersRepository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!foundUser) {
        throw new NotFoundException('Account not found');
      }

      await this.usersRepository.restore(foundUser.id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot restore user with id = \`${id}\`, ${error.message}`,
      );
    }
  }

  /**
   * generate hash password
   * @param password
   * @returns Promise<string>
   * @throws InternalServerErrorException
   */
  static async generateHashPassword(password: string): Promise<string> {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(password, saltRounds);
    if (!hashPassword) {
      throw new InternalServerErrorException('has error, try again!');
    }
    return hashPassword;
  }
}

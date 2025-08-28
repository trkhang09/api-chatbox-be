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
import { ILike, In, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { GetUsersDto } from './dtos/get-users.dto';
import { UsersDto } from './dtos/users.dto';
import { RoleType } from 'src/common/constants/role-constants';
import { RoleRepository } from '../roles/role.repository';
import { plainToInstance } from 'class-transformer';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: UsersRepository,
    @InjectRepository(Role)
    private readonly roleRepository: RoleRepository,
  ) {}

  /**
   * create new user
   */

  async createNewUser(
    createUserDto: CreateUserDto,
    createdBy: string,
  ): Promise<UserDto> {
    const [userFound, roleFound, hashPassword] = await Promise.all([
      this.usersRepository.findOne({
        where: { email: createUserDto.email },
      }),
      this.roleRepository.findOne({
        where: { id: createUserDto.roleId },
      }),
      this.generateHashPassword(createUserDto.password),
    ]);

    if (userFound) {
      throw new BadRequestException('email is used');
    }

    if (!roleFound) {
      throw new NotFoundException('role not found');
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
  }

  /**
   * update user
   */

  async updateUser(updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id: updateUserDto.userId },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExisted = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExisted) {
        throw new BadRequestException('email is already in use');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.roleId && updateUserDto.roleId !== user.role.id) {
      const roleFound = await this.roleRepository.findOne({
        where: { id: updateUserDto.roleId },
      });
      if (!roleFound) {
        throw new NotFoundException('role not found');
      }
      user.role = roleFound;
    }

    if (updateUserDto.password) {
      user.password = await this.generateHashPassword(updateUserDto.password);
    }

    if (updateUserDto.fullname) {
      user.fullname = updateUserDto.fullname;
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
  }

  /**
   * delete soft user
   */
  async deleteSoftSUser(userId: string): Promise<boolean> {
    const userFound = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!userFound) {
      throw new NotFoundException(
        'user is deleted or not found, try again later',
      );
    }
    await this.usersRepository.softDelete(userFound.id);
    return true;
  }

  /**
   * get list user
   */
  async getListUsers(
    getUsersDto: GetUsersDto,
  ): Promise<ResponsePaginateDto<Partial<User>>> {
    let where: any = {};
    if (getUsersDto?.fullname) {
      where.fullname = ILike(`%${getUsersDto.fullname}%`);
    }
    if (getUsersDto?.email) {
      where.email = ILike(`%${getUsersDto.email}%`);
    }

    if (getUsersDto?.roleIds?.length) {
      const roleIds = Array.isArray(getUsersDto.roleIds)
        ? getUsersDto.roleIds
        : [getUsersDto.roleIds];
      where.role = {
        id: In(roleIds),
      };
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      select: {
        id: true,
        fullname: true,
        updatedAt: true,
        createdAt: true,
        email: true,
        status: true,
        createdByUserId: true,
      },
      order: { [getUsersDto.sortBy]: getUsersDto.sortOrder },
      skip: (getUsersDto.page - 1) * getUsersDto.size,
      take: getUsersDto.size,
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
   */

  async getUserById(userId: string) {
    const userFound = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullname: true,
        updatedAt: true,
        createdAt: true,
        email: true,
        status: true,
        createdByUserId: true,
      },
    });

    if (!userFound) {
      throw new NotFoundException('user not found');
    }

    return userFound;
  }

  /**
   * restore user
   */
  async restoreUser(userId: string): Promise<boolean> {
    const userFound = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      withDeleted: true,
    });
    if (!userFound) {
      throw new NotFoundException('account not found');
    }
    await this.usersRepository.restore(userFound.id);
    return true;
  }

  /**
   * generate hash password
   * @param password
   * @returns
   */
  private async generateHashPassword(password: string) {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(password, saltRounds);
    if (!hashPassword) {
      throw new InternalServerErrorException('has error, try again!');
    }
    return hashPassword;
  }
}

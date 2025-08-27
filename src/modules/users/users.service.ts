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
import { ILike, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { GetUsersDto } from './dtos/get-users.dto';
import { UsersDto } from './dtos/users.dto';
import { RoleType } from 'src/common/constants/role-constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: UsersRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * create new user
   */

  async createNewUser(
    createUserDto: CreateUserDto,
    createdBy: string,
  ): Promise<UserDto> {
    const userFound = await this.usersRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (userFound) {
      throw new BadRequestException('email is used');
    }

    const hashPassword = await this.generateHashPassword(
      createUserDto.password,
    );

    // found role exits
    const roleFound = await this.roleRepository.findOne({
      where: {
        id: createUserDto.roleId,
      },
    });

    if (!roleFound) {
      throw new NotFoundException('role not found');
    }

    const userStore = this.usersRepository.create({
      fullname: createUserDto.fullname,
      email: createUserDto.email,
      password: hashPassword,
      role: roleFound,
      createdByUserId: createdBy,
    });
    await this.usersRepository.save(userStore);

    return {
      id: userStore.id,
      email: userStore.email,
      fullname: userStore.fullname,
      role: roleFound.code,
      createdBy: userStore.createdByUserId,
      createdAt: userStore.createdAt,
      updatedAt: userStore.updatedAt,
    } as UserDto;
  }

  /**
   * update user
   */

  async updateUser(updateUserDto: UpdateUserDto): Promise<UserDto> {
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

    if (updateUserDto.password) {
      user.password = await this.generateHashPassword(updateUserDto.password);
    }

    if (updateUserDto.fullname) {
      user.fullname = updateUserDto.fullname;
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

    const userUpdated = await this.usersRepository.save(user);
    return {
      id: userUpdated.id,
      email: userUpdated.email,
      fullname: userUpdated.fullname,
      role: userUpdated.role.code,
      createdAt: userUpdated.createdAt,
      updatedAt: userUpdated.updatedAt,
      createdBy: userUpdated.createdByUserId,
    } as UserDto;
  }

  /**
   * delete soft user
   */
  async deleteSoftSUser(userId: string): Promise<boolean> {
    const userFound = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      withDeleted: false,
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
   * get user list
   */

  async getListUsers(getUsersDto: GetUsersDto): Promise<UsersDto> {
    let where: any = {};

    if (getUsersDto?.fullname) {
      where.fullname = ILike(`%${getUsersDto.fullname}%`);
    }
    if (getUsersDto?.email) {
      where.email = ILike(`%${getUsersDto.email}%`);
    }

    // get online account have role is user
    const foundRole = await this.roleRepository.findOne({
      where: {
        code: RoleType.USER.toLowerCase(),
      },
    });

    if (!foundRole) {
      throw new NotFoundException('check role and try again');
    }

    where = {
      ...where,
      role: {
        id: foundRole.id,
      },
    };

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      order: { [getUsersDto.sortBy]: getUsersDto.sortOrder },
      skip: (getUsersDto.page - 1) * getUsersDto.limit,
      take: getUsersDto.limit,
    });

    const users = data.map((user) => {
      return {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: foundRole.code,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdBy: user.createdByUserId,
      } as UserDto;
    });

    return {
      limit: getUsersDto.limit,
      currentPage: getUsersDto.page,
      totalPage: Math.ceil(total / getUsersDto.limit),
      items: users,
    };
  }

  /**
   * get user by id
   */

  async getUserById(userId: string): Promise<UserDto> {
    const userFound = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      withDeleted: true,
    });

    if (!userFound) {
      throw new NotFoundException('user not found');
    }

    return {
      id: userFound.id,
      fullname: userFound.fullname,
      email: userFound.email,
      role: userFound.role.code,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
      createdBy: String(userFound.createdByUserId),
    };
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

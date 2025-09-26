import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { plainToInstance } from 'class-transformer';
import { GetUsersForChatDto } from './dtos/get-users-for-chat.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { RoleType } from 'src/common/constants/role-constants';
import { RespondUserForChatDto } from './dtos/respond-users-for-chat.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmailWithRole(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.email',
        'user.fullname',
        'user.password',
        'user.createdByUserId',
        'role.id',
        'role.name',
        'role.code',
      ])
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.fullname',
        'user.password',
        'user.createdByUserId',
      ])
      .where('user.email = :email', { email })
      .getOne();
  }

  async findReceiver(
    chatId: string,
    senderId: string,
  ): Promise<UserDto | null> {
    try {
      let userFound: User;
      const users = await this.find({
        relations: ['chats'],
        where: {
          chats: { id: chatId },
        },
      });
      if (!users) {
        throw new NotFoundException('User Not Found!');
      } else {
        userFound =
          users.length === 1
            ? users[0]
            : users.filter((u) => u.id !== senderId)[0];
      }
      if (userFound) {
        const userDto: UserDto = plainToInstance(UserDto, userFound, {
          excludeExtraneousValues: true,
        });
        return userDto;
      } else {
        throw new NotFoundException('User Not Found!');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Can not get User in this conversation',
        error.message,
      );
    }
  }

  async findForNewChat(
    userId: string,
    param: GetUsersForChatDto,
  ): Promise<ResponsePaginateDto<RespondUserForChatDto>> {
    const { isAdmin, page, size, search } = param;
    let users: User[];
    let total: number;
    try {
      const qb = this.createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect(
          'user.chats',
          'chats',
          'EXISTS ( ' +
            ' SELECT 1 FROM chat_participants cp1 ' +
            ' JOIN chat_participants cp2 ON cp1.chat_id = cp2.chat_id ' +
            ' WHERE cp1.chat_id = chats.id ' +
            '   AND cp1.user_id = user.id ' +
            '   AND cp2.user_id = :userId ' +
            ' )',
          { userId },
        )
        .where('user.id != :userId', { userId })
        .andWhere('user.status = :status', { status: UserStatus.ACTIVED })
        .andWhere('role.code != :superAdmin', {
          superAdmin: RoleType.SUPER_ADMIN,
        });

      if (isAdmin) {
        qb.andWhere('role.code != :userRole', { userRole: RoleType.USER });
      }

      if (search) {
        const searchKeyword = `%${search}%`;
        qb.andWhere(
          '(user.fullname ILIKE :searchKeyword OR user.email ILIKE :searchKeyword)',
          { searchKeyword },
        );
      }

      [users, total] = await qb
        .orderBy('user.fullname', 'ASC')
        .skip((page - 1) * size)
        .take(size)
        .getManyAndCount();
    } catch (error) {
      throw new InternalServerErrorException('Can not get Users');
    }
    const partialUsers: RespondUserForChatDto[] = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role.name,
        status: user.status,
        createdAt: user.createdAt,
        chatId: user.chats.length > 0 ? user.chats[0].id : undefined,
      };
    });
    return new ResponsePaginateDto({
      data: partialUsers,
      page: page,
      size: size,
      total: total,
      totalInPage: partialUsers.length,
      totalPage: Math.ceil(total / size),
    });
  }
}

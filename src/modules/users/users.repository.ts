import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { plainToInstance } from 'class-transformer';

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

  async findReceiver(
    chatId: string,
    senderId: string,
  ): Promise<UserDto | null> {
    try {
      const user = await this.findOne({
        relations: ['chats'],
        where: {
          chats: { id: chatId },
          id: Not(senderId),
        },
      });
      if (!user) {
        throw new NotFoundException('User Not Found!');
      }
      const userDto: UserDto = plainToInstance(UserDto, user, {
        excludeExtraneousValues: true,
      });
      return userDto;
    } catch (error) {
      throw new InternalServerErrorException(
        'Can not get User in this conversation',
        error.message,
      );
    }
  }
}

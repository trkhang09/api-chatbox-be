import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
}

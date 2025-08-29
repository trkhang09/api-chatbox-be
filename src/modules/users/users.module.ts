import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { Role } from '../roles/entities/role.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), RolesModule],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
  exports: [UsersRepository],
})
export class UsersModule {}

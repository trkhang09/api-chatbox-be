import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleRepository extends Repository<Role> {}

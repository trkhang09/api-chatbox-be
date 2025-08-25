import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    const roles = await this.roleRepo.find({ relations: ['permissions'] });
    console.log(roles);
    return roles;
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto, userId: string): Promise<Role> {
    const permissions = dto.permissions
      ? await this.permRepo.find({ where: { id: In(dto.permissions) } })
      : [];
    const role = this.roleRepo.create({
      ...dto,
      permissions,
      createdByUserId: userId,
    });
    return this.roleRepo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (dto.permissions) {
      const permissions = await this.permRepo.find({
        where: { id: In(dto.permissions) },
      });
      role.permissions = permissions;
    }
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    await this.roleRepo.delete(id);
  }
}

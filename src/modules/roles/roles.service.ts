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
    try {
      const roles = await this.roleRepo.find({ relations: ['permissions'] });
      return roles;
    } catch (error) {
      throw new Error('Failed to retrieve roles: ' + error.message);
    }
  }

  async findOne(id: string): Promise<Role> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
        relations: ['permissions'],
      });
      if (!role) throw new NotFoundException('Role not found');
      return role;
    } catch (error) {
      console.error(error);
      throw new Error(
        'Failed to retrieve role with ID: ' + id + ' - ' + error.message,
      );
    }
  }

  async create(dto: CreateRoleDto, userId: string): Promise<Role> {
    try {
      const permissions = dto.permissions
        ? await this.permRepo.find({ where: { id: In(dto.permissions) } })
        : [];
      const role = this.roleRepo.create({
        ...dto,
        permissions,
        createdByUserId: userId,
      });
      return this.roleRepo.save(role);
    } catch (error) {
      throw new Error('Failed to create role: ' + error.message);
    }
  }

  async update(id: string, dto: UpdateRoleDto, userId: string): Promise<Role> {
    try {
      const role = await this.findOne(id);
      if (dto.permissions) {
        const permissions = await this.permRepo.find({
          where: { id: In(dto.permissions) },
        });
        role.permissions = permissions;
      }
      Object.assign(role, dto);
      role.updatedByUserId = userId;
      return this.roleRepo.save(role);
    } catch (error) {
      throw new Error(
        'Failed to update role with ID: ' + id + ' - ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.roleRepo.delete(id);
    } catch (error) {
      throw new Error(
        'Failed to delete role with ID: ' + id + ' - ' + error.message,
      );
    }
  }
}

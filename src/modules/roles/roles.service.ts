import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(statusId: number): Promise<Role[]> {
    try {
      const roles = await this.roleRepo.find({
        where: { status: statusId },
      });

      return roles;
    } catch (error) {
      throw new Error('Failed to retrieve roles: ' + error.message);
    }
  }

  async findOne(id: string): Promise<Role> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
      });

      if (!role) throw new NotFoundException('Role not found');

      return role;
    } catch (error) {
      console.error(error);
      throw new NotFoundException('Role not found');
    }
  }

  async create(dto: CreateRoleRequestDto, userId: string): Promise<Role> {
    try {
      const permissions = dto.permissions
        ? await this.permRepo.find({ where: { id: In(dto.permissions) } })
        : [];
      const role = {
        ...dto,
        permissions,
        createdByUserId: userId,
      };
      return await this.roleRepo.save(role);
    } catch (error) {
      throw new Error('Failed to create role: ' + error.message);
    }
  }

  async update(id: string, dto: UpdateRoleRequestDto): Promise<Role> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
      });
      if (!role) throw new NotFoundException('Role not found');

      if (dto.permissions) {
        const permissions = await this.permRepo.find({
          where: { id: In(dto.permissions) },
        });
        role.permissions = permissions;
      }
      role.status = dto.status ?? role.status;
      role.name = dto.name ?? role.name;
      role.code = dto.code ?? role.code;

      await this.roleRepo.save(role);

      return role;
    } catch (error) {
      throw new Error('Failed to update role: ' + error.message);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
      });
      if (!role) throw new NotFoundException('Role not found');

      await this.roleRepo.remove(role);
    } catch (error) {
      throw new Error('Failed to delete role: ' + error.message);
    }
  }
}

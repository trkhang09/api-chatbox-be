import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<RoleResponseDto[]> {
    try {
      const roles = await this.roleRepo.find({
        where: { status: 1 },
        withDeleted: true,
      });

      if (!roles.length) throw new NotFoundException('No roles found');

      const result = roles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
      }));

      return result;
    } catch (error) {
      throw new Error('Failed to retrieve roles: ' + error.message);
    }
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id, status: 1 },
      });

      if (!role) throw new NotFoundException('Role not found');
      return {
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions.map((perm) => perm.name),
      };
    } catch (error) {
      console.error(error);
      throw new NotFoundException('Role not found');
    }
  }

  async create(
    dto: CreateRoleRequestDto,
    userId: string,
  ): Promise<RoleResponseDto> {
    try {
      if (
        await this.roleRepo.findOne({
          where: { code: dto.code },
          withDeleted: true,
        })
      ) {
        throw new Error('Role with this code already exists');
      }
      const permissions = dto.permissions
        ? await this.permRepo.find({ where: { id: In(dto.permissions) } })
        : [];
      const role = {
        dto,
        permissions,
        createdByUserId: userId,
      };
      const savedRole = await this.roleRepo.save(role);
      return {
        id: savedRole.id,
        name: savedRole.name,
        code: savedRole.code,
        permissions: savedRole.permissions.map((perm) => perm.name),
      };
    } catch (error) {
      throw new Error('Failed to create role: ' + error.message);
    }
  }

  async update(
    id: string,
    dto: UpdateRoleRequestDto,
    userId: string,
  ): Promise<RoleResponseDto> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!role) throw new NotFoundException('Role not found');

      if (dto.permissions) {
        const permissions = await this.permRepo.find({
          where: { id: In(dto.permissions) },
        });
        role.permissions = permissions;
      }
      role.updatedByUserId = userId;
      role.updatedAt = new Date();
      await this.roleRepo.save(role);

      return {
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions.map((perm) => perm.name),
      };
    } catch (error) {
      throw new Error('Failed to update role: ' + error.message);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id, status: 1 },
      });
      if (!role) throw new NotFoundException('Role not found');

      role.updatedAt = new Date();
      role.updatedByUserId = userId;
      role.status = 0;

      await this.roleRepo.save(role);
      await this.roleRepo.softDelete(id);
    } catch (error) {
      throw new Error('Failed to delete role: ' + error.message);
    }
  }
}

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
  /**
   * Retrieve all roles with their associated permissions.
   * @returns Promise<RoleResponseDto[]>
   * @throws Error when roles cannot be retrieved or none are found.
   */
  async findAll(): Promise<RoleResponseDto[]> {
    try {
      const roles = await this.roleRepo.find({ relations: ['permissions'] });
      if (!roles) throw new NotFoundException('No roles found');

      const result = roles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions.map((perm) => perm.name),
      }));
      return result;
    } catch (error) {
      throw new NotFoundException('No roles found');
    }
  }

  /**
   * Retrieve a single role by its ID, including permissions.
   * @param id Role ID
   * @returns Promise<RoleResponseDto>
   * @throws NotFoundException if the role does not exist.
   * @throws Error when retrieval fails.
   */
  async findOne(id: string): Promise<RoleResponseDto> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
        relations: ['permissions'],
        withDeleted: true,
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

  /**
   * Create a new role with optional permissions.
   * @param dto Data for creating a new role
   * @param userId ID of the user creating the role
   * @returns Promise<RoleResponseDto>
   * @throws Error when creation fails.
   */
  async create(
    dto: CreateRoleRequestDto,
    userId: string,
  ): Promise<RoleResponseDto> {
    try {
      if (
        await this.roleRepo.findOne({
          where: { name: dto.name },
          withDeleted: true,
        })
      ) {
        throw new Error('Role with this name already exists');
      }

      const permissions = dto.permissions
        ? await this.permRepo.find({ where: { id: In(dto.permissions) } })
        : [];

      const role = this.roleRepo.create({
        ...dto,
        permissions,
        createdByUserId: userId,
      });

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

  /**
   * Update an existing role by its ID and modify permissions if provided.
   * @param id Role ID to update
   * @param dto Data to update the role
   * @param userId ID of the user performing the update
   * @returns Promise<RoleResponseDto>
   * @throws NotFoundException if the role does not exist.
   * @throws Error when update fails.
   */
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

  /**
   * Soft delete a role by its ID.
   * @param id Role ID to delete
   * @param userId ID of the user performing the deletion
   * @returns Promise<RoleResponseDto>
   * @throws NotFoundException if the role does not exist.
   * @throws Error when deletion fails.
   */
  async remove(id: string, userId: string): Promise<RoleResponseDto> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
        relations: ['permissions'],
        withDeleted: true,
      });

      if (!role) throw new NotFoundException('Role not found');

      role.deletedAt = new Date();
      role.updatedAt = new Date();
      role.updatedByUserId = userId;

      await this.roleRepo.save(role);

      return {
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions.map((perm) => perm.name),
      };
    } catch (error) {
      throw new Error('Failed to delete role: ' + error.message);
    }
  }
}

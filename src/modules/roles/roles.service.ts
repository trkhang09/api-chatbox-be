import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
import { GetRolesDto } from './dto/get-roles-request.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(getRolesDto: GetRolesDto): Promise<ResponsePaginateDto<Role>> {
    try {
      let where = {};

      if (getRolesDto?.search) {
        where = { ...where, name: ILike(`%${getRolesDto.search}%`) };
      }

      if (getRolesDto?.status) {
        where = { ...where, status: getRolesDto.status };
      }

      const [data, total] = await this.roleRepo.findAndCount({
        where,
        order: { [getRolesDto.sortBy]: getRolesDto.sortOrder },
        take: getRolesDto.size,
        skip: (getRolesDto.page - 1) * getRolesDto.size,
      });

      return {
        data,
        size: getRolesDto.size,
        page: getRolesDto.page,
        total: total,
        totalInPage: data.length,
        totalPage: Math.ceil(total / getRolesDto.size),
      };
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
      const role = await this.findOne(id);
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

  async remove(id: string): Promise<boolean> {
    try {
      const role = await this.findOne(id);
      if (!role) throw new NotFoundException('Role not found');

      await this.roleRepo.softDelete(role.id);
      return true;
    } catch (error) {
      throw new Error('Failed to delete role: ' + error);
    }
  }
}

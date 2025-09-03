import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
import { RoleFilterRequestDto } from './dto/role-filter-request.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { plainToInstance } from 'class-transformer';
import { RoleFilterResponseDto } from './dto/role-filter-response.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(
    query: RoleFilterRequestDto,
  ): Promise<ResponsePaginateDto<RoleFilterResponseDto>> {
    try {
      let where = {};

      if (query?.search) {
        where = { ...where, name: ILike(`%${query.search}%`) };
      }

      if (query?.status) {
        where = { ...where, status: query.status };
      }

      const [data, total] = await this.roleRepo.findAndCount({
        where,
        order: {
          [query.sortBy]: query.sortOrder,
        },
        take: query.size,
        skip: (query.page - 1) * query.size,
      });

      const dtoData = plainToInstance(RoleFilterResponseDto, data, {
        excludeExtraneousValues: true,
      });

      return {
        data: dtoData,
        size: query.size,
        page: query.page,
        total: total,
        totalInPage: data.length,
        totalPage: Math.ceil(total / query.size),
      };
    } catch (error) {
      throw new Error('Failed to retrieve roles: ' + error.message);
    }
  }

  async findOne(id: string): Promise<RoleFilterResponseDto> {
    try {
      const role = await this.roleRepo.findOne({
        where: { id },
      });

      if (!role) throw new NotFoundException('Role not found');

      return plainToInstance(RoleFilterResponseDto, role, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error(error);
      throw new NotFoundException('Role not found');
    }
  }

  async create(
    dto: CreateRoleRequestDto,
    userId: string,
  ): Promise<RoleFilterResponseDto> {
    try {
      const permissions = dto.permissions
        ? await this.permRepo.find({ where: { id: In(dto.permissions) } })
        : [];
      const role = {
        ...dto,
        permissions,
        createdByUserId: userId,
      };
      const savedRole = await this.roleRepo.save(role);
      return plainToInstance(RoleFilterResponseDto, savedRole, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new Error('Failed to create role: ' + error.message);
    }
  }

  async update(
    id: string,
    dto: UpdateRoleRequestDto,
  ): Promise<RoleFilterResponseDto> {
    try {
      const role = await this.roleRepo.findOne({ where: { id } });

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

      const dtoData = plainToInstance(RoleFilterResponseDto, role, {
        excludeExtraneousValues: true,
      });
      return dtoData;
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

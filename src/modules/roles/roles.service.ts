import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleRequestDto } from './dto/create-role-request.dto';
import { UpdateRoleRequestDto } from './dto/update-role-request.dto';
import { RoleFilterRequestDto } from './dto/role-filter-request.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { plainToInstance } from 'class-transformer';
import { RoleFilterResponseDto } from './dto/role-filter-response.dto';
import { AuthUserDto } from 'src/common/dtos/auth-user.dto';
import { RoleType } from 'src/common/constants/role-constants';
import { ResponseUsersCountInRole } from '../users/dtos/response-users-count-in-role';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  /**
   * get quantity of users in each role
   * @param size
   * @returns  Promise<ResponseUsersCountInRole[]>
   * @throws InternalServerErrorException
   */
  async getUsersCountEachRoles(size: number): Promise<any[]> {
    try {
      const roles = await this.roleRepo.find({
        relations: ['users'],
        where: { code: Not(RoleType.SUPER_ADMIN) },
        select: {
          id: true,
          name: true,
          users: {
            id: true,
            role: false,
          },
        },
      });

      let listUsersByRoles = roles
        .sort((prev, next) => next.users.length - prev.users.length)
        .map((role) => new ResponseUsersCountInRole(role));

      const others = listUsersByRoles.slice(size, -1);
      listUsersByRoles = listUsersByRoles.slice(0, size);

      if (others.length > 0) {
        let otherCount = 0;
        others.forEach((role) => {
          otherCount += role.usersCount;
        });

        const other = new ResponseUsersCountInRole(
          { name: 'Others' } as Role,
          otherCount,
        );

        listUsersByRoles.push(other);
      }

      return listUsersByRoles;
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot get quantity of users in each role',
      );
    }
  }

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
      throw new NotFoundException('Role not found');
    }
  }

  async create(
    dto: CreateRoleRequestDto,
    userId: string,
  ): Promise<RoleFilterResponseDto> {
    try {
      const existingRole = await this.roleRepo.exists({
        where: { code: dto.code },
      });

      if (existingRole) {
        throw new BadRequestException('Role already exists');
      }

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
      if (role.code === RoleType.SUPER_ADMIN)
        throw new ForbiddenException('You cannot modify Super Admin role');

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

  async remove(id: string, user: AuthUserDto): Promise<boolean> {
    try {
      const role = await this.findOne(id);

      if (!role) throw new NotFoundException('Role not found');

      if (user.roleId === role.id) {
        throw new ForbiddenException('You cannot delete your own role');
      }

      await this.roleRepo.softDelete(role.id);
      return true;
    } catch (error) {
      throw new Error('Failed to delete role: ' + error);
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ILike, Repository } from 'typeorm';
import { PermissionFilterResponseDto } from './dto/permission-filter-response.dto';
import { Permission } from './entities/permission.entity';
import { PermissionFilterRequestDto } from './dto/permission-filter-request.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Record<string, PermissionFilterResponseDto[]>> {
    try {
      const permissions = await this.permRepo.find();

      const grouped = permissions.reduce(
        (accumulator, permission) => {
          const [prefix] = permission.code.split('_');
          const groupKey =
            prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();

          if (!accumulator[groupKey]) {
            accumulator[groupKey] = [];
          }

          accumulator[groupKey].push(
            plainToInstance(PermissionFilterResponseDto, {
              id: permission.id,
              name: permission.name,
            }),
          );

          return accumulator;
        },
        {} as Record<string, PermissionFilterResponseDto[]>,
      );

      return grouped;
    } catch (error) {
      throw new Error('Failed to retrieve permissions: ' + error.message);
    }
  }
  async findPermissionsByRoleId(
    param: PermissionFilterRequestDto,
  ): Promise<PermissionFilterResponseDto[]> {
    const { roleId } = param;

    try {
      const permissions = await this.permRepo.find({
        where: { roles: { id: roleId } },
      });

      return plainToInstance(PermissionFilterResponseDto, permissions, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new Error('Failed to retrieve permissions: ' + error.message);
    }
  }
}

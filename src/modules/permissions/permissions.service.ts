import { Injectable } from '@nestjs/common';
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

  async findAll(
    permissionFilterRequestDto: PermissionFilterRequestDto,
  ): Promise<PermissionFilterResponseDto[]> {
    let where = {};

    if (permissionFilterRequestDto?.search) {
      where = {
        ...where,
        name: ILike(`%${permissionFilterRequestDto.search}%`),
      };
    }
    const permissions = await this.permRepo.find({
      where,
    });
    const dtoData = plainToInstance(PermissionFilterResponseDto, permissions, {
      excludeExtraneousValues: true,
    });
    return dtoData;
  }
}

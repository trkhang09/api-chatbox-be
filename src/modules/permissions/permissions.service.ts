import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permRepo.find();
    const dtoData = plainToInstance(PermissionResponseDto, permissions, {
      excludeExtraneousValues: true,
    });
    return dtoData;
  }
}

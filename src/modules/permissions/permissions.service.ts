import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ILike, Repository } from 'typeorm';
import { PermissionFilterResponseDto } from './dto/permission-filter-response.dto';
import { Permission } from './entities/permission.entity';
import { PermissionFilterRequestDto } from './dto/permission-filter-request.dto';

@Injectable()
export class PermissionsService {}

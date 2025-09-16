import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingRepository extends Repository<Setting> {}

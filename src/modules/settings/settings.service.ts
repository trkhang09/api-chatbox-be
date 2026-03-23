import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { mapObject } from 'src/common/utils/map-object';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { ILike } from 'typeorm';
import { castValue } from 'src/common/utils/cast-value';
// import { ResponseSettingsDto } from './dtos/response-settings.dto';
// import { UpdateSettingDto } from './dtos/update-setting.dto';
// import { ResponseSettingDto } from './dtos/response-setting.dto';
// import { GetSettingsDto } from './dtos/get-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: SettingRepository,
  ) {}
}

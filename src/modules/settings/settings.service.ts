import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { GetSettingsDto } from './dtos/get-settings.dto';
import { mapObject } from 'src/common/utils/map-object';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { ILike } from 'typeorm';
import { ResponseSettingsDto } from './dtos/response-settings.dto';
import { UpdateSettingDto } from './dtos/update-setting.dto';
import { ResponseSettingDto } from './dtos/response-setting.dto';
import { castValue } from 'src/common/utils/cast-value';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: SettingRepository,
  ) {}
  /**
   * get all settings pagination
   */
  async getAllSettings(
    getSettingsDto: GetSettingsDto,
  ): Promise<ResponseSettingsDto> {
    let where: any = {};
    if (getSettingsDto.search) {
      where = [
        {
          key: ILike(`%${getSettingsDto.search}%`),
        },
        {
          description: ILike(`%${getSettingsDto.search}%`),
        },
      ];
    }

    const [settings, total] = await this.settingRepository.findAndCount({
      where,
      order: { [getSettingsDto.sortBy]: getSettingsDto.sortOrder },
      skip: (getSettingsDto.page - 1) * getSettingsDto.size,
      take: getSettingsDto.size,
    });

    const data = settings.map((setting) =>
      mapObject(setting, new ResponseSettingDto()),
    );

    return {
      data,
      size: getSettingsDto.size,
      page: getSettingsDto.page,
      total: total,
      totalInPage: settings.length,
      totalPage: Math.ceil(total / getSettingsDto.size),
    };
  }

  /**
   * get value by key
   * @param key
   * @returns
   */
  async getValueByKey(key: string): Promise<string | number | boolean> {
    const setting = await this.settingRepository.findOneBy({ key });
    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return castValue(setting.value);
  }

  /**
   * update setting
   * @param updateSettingDto
   * @param settingId
   * @returns
   */
  async updateSetting(
    updateSettingDto: UpdateSettingDto,
    settingId: string,
  ): Promise<ResponseSettingDto> {
    const settingFound = await this.settingRepository.findOneBy({
      id: settingId,
    });

    if (!settingFound) {
      throw new NotFoundException('setting not found');
    }

    if (
      updateSettingDto.description !== undefined &&
      updateSettingDto.description !== settingFound.description
    ) {
      settingFound.description = updateSettingDto.description;
    }

    if (updateSettingDto.value !== settingFound.value) {
      if (
        settingFound.type !== 'string' &&
        settingFound.type !== typeof castValue(updateSettingDto.value)
      ) {
        throw new BadRequestException('value invalid with type');
      }

      settingFound.value = updateSettingDto.value;
    }

    const updatedSetting = await this.settingRepository.save(settingFound);

    if (!updatedSetting) {
      throw new InternalServerErrorException('update setting false, try again');
    }

    return mapObject(updatedSetting, new ResponseSettingDto());
  }

  /**
   * get setting by id
   * @param settingId
   * @returns
   */
  async getSettingById(settingId: string): Promise<ResponseSettingDto> {
    const settingFound = await this.settingRepository.findOneBy({
      id: settingId,
    });

    if (!settingFound) {
      throw new NotFoundException('setting not found');
    }

    return mapObject(settingFound, new ResponseSettingDto());
  }
}

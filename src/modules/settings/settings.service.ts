import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { GetSettingsDto } from './dtos/get-settings.dto';
import { mapObject } from 'src/common/utils/map-object';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { ILike } from 'typeorm';
import { TypeSettings } from 'src/common/enums/type-settings.enum';
import { ResponseSettingsDto } from './dtos/response-settings.dto';
import { UpdateSettingDto } from './dtos/update-setting.dto';
import { ResponseSettingDto } from './dtos/response-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: SettingRepository,
  ) {}
  /**
   * get all settings
   */
  async getAllSettings(
    getSettingsDto: GetSettingsDto,
  ): Promise<ResponseSettingsDto> {
    let where: any = {};
    if (getSettingsDto?.search) {
      where = [
        {
          key: ILike(`%${getSettingsDto.search}%`),
        },
        {
          desciption: ILike(`%${getSettingsDto.search}%`),
        },
      ];
    }

    const [settings, total] = await this.settingRepository.findAndCount({
      where,
      order: { [getSettingsDto.sortBy]: getSettingsDto.sortOrder },
      skip: (getSettingsDto.page - 1) * getSettingsDto.size,
      take: getSettingsDto.size,
    });

    return {
      data: settings,
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
  async getValueByKey(key: string): Promise<string | boolean | number> {
    const setting = await this.settingRepository.findOneBy({ key });
    if (!setting) {
      throw new BadRequestException(`Setting with key ${key} not found`);
    }

    switch (setting.type) {
      case TypeSettings.BOOLEAN:
        return setting.value === 'true' || setting.value === '1';
      case TypeSettings.NUMBER:
        return Number(setting.value);
      case TypeSettings.STRING:
      default:
        return setting.value;
    }
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
      updateSettingDto.description &&
      updateSettingDto.description !== settingFound.description
    ) {
      settingFound.description = updateSettingDto.description;
    }

    if (
      updateSettingDto.value !== settingFound.value ||
      updateSettingDto.type !== settingFound.type
    ) {
      if (
        updateSettingDto.type === TypeSettings.BOOLEAN &&
        !['true', 'false'].includes(updateSettingDto.value)
      ) {
        throw new BadRequestException('value invalid with type');
      } else if (
        updateSettingDto.type === TypeSettings.NUMBER &&
        isNaN(Number(updateSettingDto.value))
      ) {
        throw new BadRequestException('value invalid with type');
      }
      settingFound.value = updateSettingDto.value;
      settingFound.type = updateSettingDto.type;
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

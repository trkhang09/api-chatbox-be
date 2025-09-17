import { appDataSource } from 'src/data-source';
import { In } from 'typeorm';
import { Setting } from 'src/modules/settings/entities/setting.entity';
import { SettingConstants } from 'src/common/constants/setting-constrants';
import { TypeSettings } from 'src/common/enums/type-settings.enum';
import seededSettings from './settings.seeder.json';

export class SettingSeeder {
  public async run(): Promise<void> {
    const repo = appDataSource.getRepository(Setting);

    const settingKeys = Object.values<string>(SettingConstants);

    const foundSettings = await repo.find({
      where: { key: In(settingKeys) },
    });

    const newSettings: (Setting | Partial<Setting>)[] = [];

    seededSettings
      .filter((setting) =>
        Object.values<string>(SettingConstants).includes(setting.key + ''),
      )
      .forEach((setting) => {
        const existSetting =
          foundSettings.find((s) => s.key === setting.key) ?? {};

        newSettings.push({
          ...existSetting,
          ...setting,
          value: setting.value + '',
          type: typeof setting.value as TypeSettings,
        });
      });

    await repo.save(newSettings);
  }
}

(async () => {
  try {
    const seeder = new SettingSeeder();

    await appDataSource.initialize();
    await seeder.run();
    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(`Error seeding settings: ${error.message}`);
  } finally {
    process.exit(1);
  }
})();

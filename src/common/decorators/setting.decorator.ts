import { SetMetadata } from '@nestjs/common';

export const SETTING_KEY = 'setting';
export const Setting = (setting: string) => SetMetadata(SETTING_KEY, setting);

import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingRepository } from './setting.repository';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingsService, SettingRepository],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}

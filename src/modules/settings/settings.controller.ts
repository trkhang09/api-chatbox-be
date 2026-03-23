import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
// import { GetSettingsDto } from './dtos/get-settings.dto';
// import { ResponseSettingsDto } from './dtos/response-settings.dto';
// import { ResponseSettingDto } from './dtos/response-setting.dto';
// import { UpdateSettingDto } from './dtos/update-setting.dto';

@Controller('settings')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
@ApiTags('Settings Management')
@Controller('settings')
export class SettingsController {}

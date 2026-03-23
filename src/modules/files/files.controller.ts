import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiOkResponseCustom } from 'src/common/decorators/api-ok-response.decorator';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { FileSecurityKey } from 'src/common/decorators/file-security-key.decorator';
import { AllowedFileTypes } from 'src/common/enums/allowed-file-type.enum';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { PermissionType } from 'src/common/constants/permission-constants';
import { Permissions } from 'src/common/decorators/permission.decorator';
// import { RequestFileDto } from './dtos/request-file.dto';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
@ApiTags('Upload Files')
@Controller('files')
@UseGuards(PermissionGuard)
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
export class FileController {
  constructor(private readonly fileService: FileService) {}
}

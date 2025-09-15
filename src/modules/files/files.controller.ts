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
import { RequestFileDto } from './dtos/request-file.dto';
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

  @Get('/')
  @Permissions(PermissionType.FILE_GET)
  @ApiOperation({ summary: 'Get paginated list of files uploaded to server' })
  @ApiOkResponseCustom(ResponsePaginateDto<String>, {
    data: [
      'Cover-2025-09-05T07-45-32.753Z.docx',
      'CV-2025-09-05T07-45-44.096Z.pdf',
    ],
    size: 20,
    page: 1,
    total: 135,
    totalPage: 7,
    totalInPage: 20,
  })
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  async getAllFiles(@Query() query: PaginateDto) {
    return this.fileService.getFiles(query);
  }

  @FileSecurityKey()
  @Get('/:filePath')
  @Permissions(PermissionType.FILE_GET)
  @ApiOperation({ summary: 'Get buffer of a specific file' })
  @ApiCommonResponseCustom(
    Buffer<ArrayBufferLike>,
    '<Buffer 25 50 44 46 2d 46 41 4b 45 2d 46 49 4c 45 25>',
  )
  async getFileBuffer(@Param('filePath') filePath: string, @Res() res) {
    const file = await this.fileService.getFileBuffer(filePath);
    const type: string = filePath.split('.').pop() ?? AllowedFileTypes.docx;

    res.setHeader('Content-Type', AllowedFileTypes[type]);
    return res.send(file);
  }

  @Post('/')
  @Permissions(PermissionType.FILE_CREATE)
  @ApiOperation({ summary: 'upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Accepted file types: .pdf, .docx',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiCommonResponseCustom(String, '/uploaded/files/Test_Doc.docx')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RequestFileDto,
  ) {
    return await this.fileService.upload(file, body.fileName);
  }

  @Put('/:filePath')
  @Permissions(PermissionType.FILE_UPDATE)
  @ApiOperation({ summary: 'Rename a specific unused file in server' })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          description: 'New name that you want to apply for this file',
        },
      },
    },
  })
  @ApiCommonResponseCustom(String, '/uploaded/files/Test_Doc.docx')
  async renameFile(
    @Param('filePath') filePath: string,
    @Body() body: RequestFileDto,
  ) {
    return this.fileService.rename(filePath, body.fileName ?? '');
  }

  @Delete('/:filePath')
  @Permissions(PermissionType.FILE_DELETE)
  @ApiOperation({ summary: 'remove a specific unused file in server' })
  @ApiCommonResponseCustom(Boolean, true)
  async removeFile(@Param('filePath') filePath: string) {
    return this.fileService.remove(filePath);
  }
}

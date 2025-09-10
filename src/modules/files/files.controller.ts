import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  @ApiOperation({ summary: 'Get all files uploaded to server' })
  @ApiOkResponseCustom(Array<String>, [
    'Cover-2025-09-05T07-45-32.753Z.docx',
    'CV-2025-09-05T07-45-44.096Z.pdf',
  ])
  @ApiInternalServerErrorResponseCustom()
  async getAllFiles() {
    return this.fileService.getAllFiles();
  }

  @FileSecurityKey()
  @Get('/:filePath')
  @Permissions(PermissionType.FILE_GET)
  // @UseGuards(AuthGuard)
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
    description: 'Upload a Swagger JSON file',
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
    @Body('fileName') fileName?: string,
  ) {
    return await this.fileService.upload(file, fileName ?? file.originalname);
  }
}

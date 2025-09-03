import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { Public } from '../auth/public.decorator';

@ApiTags('Upload Files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post('/')
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

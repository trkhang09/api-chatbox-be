import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ResponseDocumentDto } from './dtos/response-document.dto';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { GetPaginatedDocumentsDto } from './dtos/get-paginated-documents.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ResponseCreatedDocumentDto } from './dtos/response-created-document.dto';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import { ResponseUpdatedDocumentDto } from './dtos/response-updated-document.dto';
import { ResponseRemovedDocumentDto } from './dtos/response-removed-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly docService: DocumentsService) {}

  @Get('/paginated')
  @ApiOperation({ summary: 'Get paginated list of documents' })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, ResponseDocumentDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  async getPaginatedDocuments(@Query() query: GetPaginatedDocumentsDto) {}

  @Post('/')
  @ApiCommonResponseCustom(ResponseCreatedDocumentDto)
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({ summary: 'Upload a document file into server' })
  @ApiConsumes('multipart/form-data')
  async uploadDocument(
    @UploadedFile() document: Express.Multer.File,
    @Body() body: CreateDocumentDto,
  ) {}

  @Put('/')
  @ApiCommonResponseCustom(ResponseUpdatedDocumentDto)
  @ApiOperation({ summary: "Update a specific document's information" })
  async updateDocument(@Body() body: UpdateDocumentDto) {}

  @Delete('/:id')
  @ApiCommonResponseCustom(ResponseRemovedDocumentDto)
  @ApiOperation({ summary: 'Softly remove a specific document' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document which will be removed',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  async removeDocument(@Param('id') id: string) {}
}

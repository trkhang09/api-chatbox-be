import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ResponseDocumentDto } from './dtos/response-document.dto';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { GetPaginatedDocumentsDto } from './dtos/get-paginated-documents.dto';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { ResponseCreatedDocumentDto } from './dtos/response-created-document.dto';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import { ResponseUpdatedDocumentDto } from './dtos/response-updated-document.dto';
import { User } from '../users/entities/user.entity';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ResponseDetailedDocumentDto } from './dtos/response-detailed-document.dto';
import { AuthGuard } from '../auth/jwt/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionType } from 'src/common/constants/permission-constants';

@Controller('documents')
@UseGuards(PermissionGuard)
export class DocumentsController {
  constructor(private readonly docService: DocumentsService) {}

  @Get('/')
  @Permissions(PermissionType.DOCUMENT_GET)
  @ApiOperation({ summary: 'Get paginated list of documents' })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, ResponseDocumentDto)
  @ApiBadRequestResponseCustom()
  @ApiInternalServerErrorResponseCustom()
  async getPaginatedDocuments(@Query() query: GetPaginatedDocumentsDto) {
    return this.docService.getPaginatedDocuments(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: "Get a specific document's information" })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document which will be returned',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @ApiCommonResponseCustom(ResponseDetailedDocumentDto)
  async getDetailDocument(@Param('id') id: string) {
    return this.docService.getDocument(id);
  }

  @Post('/')
  @Permissions(PermissionType.DOCUMENT_CREATE)
  @ApiOperation({ summary: 'Create a new document' })
  @ApiCommonResponseCustom(ResponseCreatedDocumentDto)
  @ApiNotFoundResponseCustom()
  async createDocument(
    @Body() body: CreateDocumentDto,
    @AuthUser() user: User,
  ) {
    return this.docService.createDocument(body, user);
  }

  @Put('/:id')
  @Permissions(PermissionType.DOCUMENT_UPDATE)
  @ApiCommonResponseCustom(ResponseUpdatedDocumentDto)
  @ApiNotFoundResponseCustom()
  @ApiOperation({ summary: "Update a specific document's information" })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document which will be updated',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  async updateDocument(
    @Param('id') id: string,
    @Body() body: UpdateDocumentDto,
    @AuthUser() user: User,
  ) {
    return this.docService.updateDocument(id, body, user);
  }

  @Delete('/:id')
  @Permissions(PermissionType.DOCUMENT_DELETE)
  @ApiCommonResponseCustom(Boolean, true)
  @ApiNotFoundResponseCustom()
  @ApiOperation({ summary: 'Softly remove a specific document' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document which will be removed',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  async removeDocument(@Param('id') id: string) {
    return this.docService.removeDocument(id);
  }

  @ApiOperation({
    summary: 'request for get progress document',
  })
  @ApiParam({
    name: 'documentId',
    description: 'The ID of the document',
    example: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    type: 'string',
  })
  @Get(':id/progress')
  async getProgressDocument(@Param('id') id: string) {
    return await this.docService.getProgressDocument(id);
  }
}

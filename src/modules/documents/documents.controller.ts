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
import {
  DashboardForDocumentRequestDto,
  DocumentsService,
} from './documents.service';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';
import { ResponseDocumentDto } from './dtos/response-document.dto';
import { ApiInternalServerErrorResponseCustom } from 'src/common/decorators/api-internal-server-error-response.decorator';
import { ApiBadRequestResponseCustom } from 'src/common/decorators/api-bad-request-response.decorator';
import { GetPaginatedDocumentsDto } from './dtos/get-paginated-documents.dto';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { ResponseCreatedDocumentDto } from './dtos/response-created-document.dto';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import { ResponseUpdatedDocumentDto } from './dtos/response-updated-document.dto';
import { User } from '../users/entities/user.entity';
import { ApiNotFoundResponseCustom } from 'src/common/decorators/api-not-found-response.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ResponseDetailedDocumentDto } from './dtos/response-detailed-document.dto';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionType } from 'src/common/constants/permission-constants';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';
import { ApiDashboardQuantity } from 'src/common/decorators/api-dashboard-quantity.decorator';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { getEnumJoin } from 'src/common/utils/get-enum-join';
import { isNumber } from 'class-validator';

@Controller('documents')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
@UseGuards(PermissionGuard)
export class DocumentsController {
  constructor(private readonly docService: DocumentsService) {}

  @ApiDashboardQuantity(DocumentStatus)
  @Permissions(PermissionType.DOCUMENT_GET)
  async getQuantity(
    @Query() query: InstanceType<typeof DashboardForDocumentRequestDto>,
  ) {
    return this.docService.getQuantity(query);
  }

  @Get('/latest')
  @ApiOperation({
    summary:
      'Get list of documents with or without status within a specific number of days',
  })
  @ApiQuery({
    name: 'status',
    enum: Object.values(DocumentStatus).filter((v) => isNumber(v)),
    description: 'Status value, must be one of: ' + getEnumJoin(DocumentStatus),
    example: Object.values(DocumentStatus)[0],
    required: false,
  })
  @ApiQuery({
    name: 'days',
    type: Number,
    description: 'Number of days (max 90)',
    minimum: 1,
    maximum: 90,
    example: 30,
  })
  @ApiCommonResponseCustom(Array<ResponseDocumentDto>, [
    {
      id: '6b7b09a3-6f59-421b-909c-4907a51011e8',
      title: 'Project Plan',
      description: 'This document contains the detailed project plan for Q1.',
      status: DocumentStatus.PENDING,
      size: 23,
      createdAt: '2025-08-27T14:30:00.000Z',
      updatedAt: '2025-08-27T14:30:00.000Z',
      createdByUserId: 'd9b2d63d-a233-4123-847a-7c35fcb9a1b5',
    },
  ])
  async getLatestDocuments(
    @Query() query: InstanceType<typeof DashboardForDocumentRequestDto>,
  ) {
    return this.docService.getLatestDocuments(query);
  }

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
}

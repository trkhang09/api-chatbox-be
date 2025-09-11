import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DocumentChunksService } from './document-chunks.service';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseChunkDto } from './dtos/response-chunk.dto';
import { ApiForbiddenResponseCustom } from 'src/common/decorators/api-forbidden-response.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionType } from 'src/common/constants/permission-constants';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { ApiPaginatedResponseCustom } from 'src/common/decorators/api-paginated-response.decorator';

@ApiTags('Document Chunks')
@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiForbiddenResponseCustom()
// @UseGuards(PermissionGuard)
@Controller('document-chunks')
export class DocumentChunksController {
  constructor(private readonly docChunkService: DocumentChunksService) {}

  @Get('/:docId/chunks')
  @Permissions(PermissionType.DOCUMENT_GET)
  @ApiOperation({ summary: 'Get list of chunks of a specific document' })
  @ApiPaginatedResponseCustom(ResponsePaginateDto, ResponseChunkDto)
  async getListChunksOfDocument(
    @Param('docId') docId: string,
    @Query() query: PaginateDto,
  ) {
    return this.docChunkService.getListChunksOfDocument(docId, query);
  }

  @Get('/:id')
  @Permissions(PermissionType.DOCUMENT_GET)
  @ApiCommonResponseCustom(String, 'his is a response message chunk.')
  async getChunkContent(@Param('id') id: string) {
    return this.docChunkService.getChunkContent(id);
  }
}

import { Body, Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @ApiOperation({
    summary: 'request create document',
  })
  @Post()
  async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
    return await this.documentService.createDocument(createDocumentDto);
  }

  @ApiOperation({
    summary: 'request for get progress document',
  })
  @Get(':documentId/progress')
  async getProgressDocument(@Param('documentId') documentId: string) {
    return await this.documentService.getProgressDocument(documentId);
  }
}

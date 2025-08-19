import { Module } from '@nestjs/common';
import { DocumentChunksService } from './document-chunks.service';
import { DocumentChunksController } from './document-chunks.controller';

@Module({
  providers: [DocumentChunksService],
  controllers: [DocumentChunksController]
})
export class DocumentChunksModule {}

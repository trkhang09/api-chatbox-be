import { Module } from '@nestjs/common';
import { DocumentChunksService } from './document-chunks.service';
import { DocumentChunksController } from './document-chunks.controller';
import { DocumentChunks } from './entities/document-chunks.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunksRepository } from './document-chunks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentChunks])],
  providers: [DocumentChunksService, DocumentChunksRepository],
  exports: [DocumentChunksRepository],
  controllers: [DocumentChunksController],
})
export class DocumentChunksModule {}

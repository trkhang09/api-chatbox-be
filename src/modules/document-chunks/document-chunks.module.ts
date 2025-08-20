import { Module } from '@nestjs/common';
import { DocumentChunksService } from './document-chunks.service';
import { DocumentChunksController } from './document-chunks.controller';
import { DocumentChunks } from './entities/document-chunks.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentChunks])],
  providers: [DocumentChunksService],
  controllers: [DocumentChunksController],
})
export class DocumentChunksModule {}

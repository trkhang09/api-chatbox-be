import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { DocumentChunksModule } from '../document-chunks/document-chunks.module';

@Module({
  imports: [DocumentChunksModule],
  providers: [GeminiService],
  controllers: [GeminiController],
})
export class GeminiModule {}

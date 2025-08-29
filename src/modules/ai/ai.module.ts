import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenaiService } from '../openai/openai.service';
import { GeminiService } from '../gemini/gemini.service';
import { AiProvider } from './ai.provider';
import { GeminiModule } from '../gemini/gemini.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [GeminiModule, OpenaiModule],
  providers: [AiProvider],
  exports: [AiProvider],
})
export class AiModule {}

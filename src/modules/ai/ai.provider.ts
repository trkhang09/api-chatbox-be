// ai.provider.ts
import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { OpenaiService } from '../openai/openai.service';
import { GeminiService } from '../gemini/gemini.service';
import { ai } from 'src/common/constants/ai.constants';

export const AiProvider: FactoryProvider = {
  provide: 'AI_SERVICE',
  useFactory: (
    configService: ConfigService,
    openAiService: OpenaiService,
    geminiService: GeminiService,
  ): AiService => {
    const provider = configService.get<string>('AI_PROVIDER') ?? ai.OPENAI;

    if (provider === ai.GEMINI) {
      return geminiService;
    }
    return openAiService;
  },
  inject: [ConfigService, OpenaiService, GeminiService],
};

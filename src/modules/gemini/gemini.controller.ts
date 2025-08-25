import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('generate-embedding')
  async generateEmbedding(@Query('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    return this.geminiService.generateEmbedding(prompt);
  }

  @Get('generate-response')
  async generateResponse(@Query('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    return this.geminiService.generateResponse(prompt);
  }
}

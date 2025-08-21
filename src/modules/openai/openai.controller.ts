import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Get('generate')
  async generateText(@Query('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    return this.openaiService.generateText(prompt);
  }
}

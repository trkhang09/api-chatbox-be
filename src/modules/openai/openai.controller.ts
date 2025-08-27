import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';

@ApiTags('Open AI')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Get('generate')
  @ApiCommonResponseCustom(Object, {})
  async generateText(@Query('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    return this.openaiService.generateText(prompt);
  }
}

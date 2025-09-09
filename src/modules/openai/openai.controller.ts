import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';

@ApiSecurity('bare-token')
@ApiSecurity('x-client-id')
@ApiTags('Open AI')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Get('generate')
  @ApiCommonResponseCustom(Object, {})
  @ApiOperation({
    summary: 'Get generate text from Open Ai with a specific prompt',
  })
  async generateText(@Query('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    return this.openaiService.generateText(prompt);
  }
}

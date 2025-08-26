import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRequestDto } from './dto/user-request.dto';
import { AiResponseDto } from './dto/ai-response.dto';

@ApiTags('Gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-response')
  @ApiOperation({ summary: 'Generate AI response for a given prompt' })
  @ApiResponse({
    status: 200,
    description: 'AI response generated successfully',
    type: AiResponseDto,
  })
  async generateResponse(@Body() dto: UserRequestDto): Promise<AiResponseDto> {
    return this.geminiService.generateResponse(dto.prompt);
  }

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate summary for a given message' })
  @ApiResponse({
    status: 200,
    description: 'Summary generated successfully',
    type: AiResponseDto,
  })
  async generateSummary(@Body() dto: UserRequestDto): Promise<AiResponseDto> {
    return this.geminiService.generateSummary(dto.prompt);
  }
}

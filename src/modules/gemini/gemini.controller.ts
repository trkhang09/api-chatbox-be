import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiService } from './gemini.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserRequestDto } from './dto/user-request.dto';
import { AiResponseDto } from './dto/ai-response.dto';
import { EmbeddingResponseDto } from './dto/create-embedding-response.dto';

@ApiTags('Gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-embedding')
  @ApiOperation({ summary: 'Generate embeddings from uploaded file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description:
      'Returns an array of objects containing the original text and its embedding',
    type: EmbeddingResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async generateEmbedding(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EmbeddingResponseDto[]> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.geminiService.generateEmbedding(file.buffer.toString('utf-8'));
  }

  @Post('generate-response')
  @ApiOperation({ summary: 'Generate AI response for a given prompt' })
  @ApiResponse({
    status: 200,
    description: 'Return AI response based on user prompt',
    type: AiResponseDto,
  })
  async generateResponse(@Body() dto: UserRequestDto): Promise<AiResponseDto> {
    return this.geminiService.generateResponse(dto.prompt);
  }

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate summary for a given message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a summary of the given message',
    type: AiResponseDto,
  })
  async generateSummary(@Body() dto: UserRequestDto): Promise<AiResponseDto> {
    return this.geminiService.generateSummary(dto.prompt);
  }
}

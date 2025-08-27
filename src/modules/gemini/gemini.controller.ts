import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiService } from './gemini.service';
import { ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserRequestDto } from './dto/user-request.dto';
import { AiResponseDto } from './dto/ai-response.dto';
import { EmbeddingResponseDto } from './dto/create-embedding-response.dto';
import { ApiCommonResponseCustom } from 'src/common/decorators/api-common-response.decorator';

@ApiTags('Gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-embedding')
  @ApiOperation({ summary: 'Generate embeddings from uploaded file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a Swagger JSON file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Accepted file types: .pdf, .docx',
        },
      },
    },
  })
  @ApiCommonResponseCustom(EmbeddingResponseDto)
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
  @ApiCommonResponseCustom(AiResponseDto)
  async generateResponse(@Body() dto: UserRequestDto): Promise<AiResponseDto> {
    return this.geminiService.generateResponse(dto.prompt);
  }

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate summary for a given message' })
  @ApiCommonResponseCustom(AiResponseDto)
  async generateSummary(@Body() dto: UserRequestDto): Promise<AiResponseDto> {
    return this.geminiService.generateSummary(dto.prompt);
  }
}

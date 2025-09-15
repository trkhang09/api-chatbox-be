import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { DocumentChunksRepository } from '../document-chunks/document-chunks.repository';
import { AiResponseDto } from './dto/ai-response.dto';
import { EmbeddingResponseDto } from './dto/create-embedding-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentChunks } from '../document-chunks/entities/document-chunks.entity';
import { promptTemplate } from 'src/common/utils/template';
import { replacePlaceHolder } from 'src/common/utils';

dotenv.config();

@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private readonly googleGenAI: GoogleGenAI;
  private readonly embeddingModel: string = 'gemini-embedding-001';
  private readonly completionModel: string = 'gemini-2.5-flash';
  private readonly LIMIT_CONTENTS: number = 2;
  private readonly promptTemplate = promptTemplate;

  constructor(
    private readonly documentChunksRepository: DocumentChunksRepository,
  ) {
    this.apiKey = process.env.GEMINI_API_KEY ?? '';
    this.googleGenAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  private generateContext(content: string, prompt: string): string {
    const { user } = promptTemplate;
    return replacePlaceHolder(user, { content: content, prompt: prompt });
  }

  async generateEmbedding(input: string): Promise<EmbeddingResponseDto[]> {
    try {
      const texts = input
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== '');

      const embeddings: EmbeddingResponseDto[] = [];

      for (const chunk of texts) {
        const response = await this.googleGenAI.models.embedContent({
          model: this.embeddingModel,
          contents: chunk,
        });
        const embedding = response.embeddings?.[0]?.values ?? [];
        embeddings.push({ content: chunk, embedding });
      }

      return embeddings;
    } catch (error) {
      throw new Error(
        `Failed to get embedding from Gemini API: ${error.message}`,
      );
    }
  }

  async generateResponse(prompt: string): Promise<AiResponseDto> {
    try {
      const convertPrompt = await this.generateEmbedding(prompt);
      const query = await this.documentChunksRepository.findClosestByEmbedding(
        convertPrompt[0].embedding,
      );

      const content = query?.content || '';
      const inDocuments = !!content;
      const response = await this.googleGenAI.models.generateContent({
        model: this.completionModel,
        contents: [
          {
            parts: [
              {
                text: this.promptTemplate.system,
              },
            ],
            role: 'model',
          },
          {
            parts: [
              {
                text: this.generateContext(content, prompt),
              },
            ],
            role: 'user',
          },
        ],
      });

      return {
        content: response.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
        model: this.completionModel,
        inDocument: inDocuments,
      };
    } catch (error) {
      throw new Error(
        `Failed to get response from Gemini API: ${error.message}`,
      );
    }
  }

  async *generateStreamResponse(prompt: string) {
    try {
      const convertPrompt = await this.generateEmbedding(prompt);
      const rawContent = await this.documentChunksRepository.findByEmbedding({
        embedding: convertPrompt[0].embedding,
        limit: this.LIMIT_CONTENTS,
      });
      const content = JSON.stringify(rawContent);
      const response = await this.googleGenAI.models.generateContentStream({
        model: this.completionModel,
        contents: [
          {
            parts: [
              {
                text: this.promptTemplate.system,
              },
            ],
            role: 'model',
          },
          {
            parts: [
              {
                text: this.generateContext(content, prompt),
              },
            ],
            role: 'user',
          },
        ],
      });
      for await (const chunk of response) {
        yield chunk.text;
      }
    } catch (error) {
      throw new Error(
        `Failed to get response from Gemini API: ${error.message}`,
      );
    }
  }

  async generateSummary(message: string): Promise<AiResponseDto> {
    try {
      const prompt = `Tạo một tiêu đề ngắn gọn, súc tích (tối đa 8 từ) cho nội dung sau để dùng làm tên lịch sử đoạn chat:\n${message}\nKhông thêm ký tự đặc biệt, không dấu chấm.`;

      const response = await this.googleGenAI.models.generateContent({
        model: this.completionModel,
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
            role: 'user',
          },
        ],
      });
      const title = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return {
        content: title,
        model: this.completionModel,
        inDocument: false,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate summary from Gemini API: ${error.message}`,
      );
    }
  }
}

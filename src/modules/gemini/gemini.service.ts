import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { DocumentChunksRepository } from '../document-chunks/document-chunks.repository';
import { AiResponseDto } from './dto/ai-response.dto';
import { EmbeddingResponseDto } from './dto/create-embedding-response.dto';

dotenv.config();

@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private readonly googleGenAI: GoogleGenAI;
  private readonly embeddingModel: string = 'gemini-embedding-001';
  private readonly completionModel: string = 'gemini-1.5-pro';
  private readonly modelKnowledge: string = 'Bạn là một trợ lý ảo vui tính.';

  constructor(
    private readonly documentChunksRepository: DocumentChunksRepository,
  ) {
    this.apiKey = process.env.GEMINI_API_KEY ?? '';
    this.googleGenAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  private generateContext(content: string, prompt: string): string {
    if (content) {
      return `Dưới đây là một số thông tin nội bộ được lấy từ tài liệu: ${content}. \nCâu hỏi của người dùng: ${prompt}.\nHãy dựa vào thông tin trên để trả lời tự nhiên, dễ hiểu.\nNếu thông tin không có trong dữ liệu, hãy trả lời rằng bạn không có thông tin.\nTuyệt đối không bịa ra câu trả lời.`;
    } else {
      return `Câu hỏi của người dùng: ${prompt}.\nHãy trả lời dựa trên kiến thức của bạn một cách tự nhiên, dễ hiểu.\nTuyệt đối không bịa ra câu trả lời.`;
    }
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

  // async generateResponse(prompt: string): Promise<AiResponseDto> {
  //   try {
  //     const convertPrompt = await this.generateEmbedding(prompt);
  //     // const query = await this.documentChunksRepository.findClosestByEmbedding(
  //     //   convertPrompt[0].embedding,
  //     // );

  //     // const content = query?.content || '';
  //     const content = 'Máu đỏ da vàng tôi là người việt nam'
  //     const inDocuments = !!content;
  //     const response = await this.googleGenAI.models.generateContent({
  //       model: this.completionModel,
  //       contents: [
  //         {
  //           parts: [
  //             {
  //               text: this.modelKnowledge,
  //             },
  //           ],
  //           role: 'model',
  //         },
  //         {
  //           parts: [
  //             {
  //               text: this.generateContext(content, prompt),
  //             },
  //           ],
  //           role: 'user',
  //         },
  //       ],
  //     });

  //     return {
  //       content: response.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
  //       model: this.completionModel,
  //       inDocument: inDocuments,
  //     };
  //   } catch (error) {
  //     throw new Error(
  //       `Failed to get response from Gemini API: ${error.message}`,
  //     );
  //   }
  // }

  async *generateResponse(prompt: string) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    try {
      const convertPrompt = await this.generateEmbedding(prompt);
      // const query = await this.documentChunksRepository.findClosestByEmbedding(
      //   convertPrompt[0].embedding,
      // );

      // const content = query?.content || '';
      const content = 'Máu đỏ da vàng tôi là người việt nam';
      const inDocuments = !!content;
      // const response = await this.googleGenAI.models.generateContent({
      //   model: this.completionModel,
      //   contents: [
      //     {
      //       parts: [
      //         {
      //           text: this.modelKnowledge,
      //         },
      //       ],
      //       role: 'model',
      //     },
      //     {
      //       parts: [
      //         {
      //           text: this.generateContext(content, prompt),
      //         },
      //       ],
      //       role: 'user',
      //     },
      //   ],
      // });

      // return {
      //   content: response.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
      //   model: this.completionModel,
      //   inDocument: inDocuments,
      // };

      while (true) {
        await sleep(200);
        yield 'Hello word chunk';
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

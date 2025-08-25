import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { DocumentChunksRepository } from '../document-chunks/document-chunks.repository';

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

  private generateContext(content: string | null, prompt: string): string {
    if (content) {
      return `Dưới đây là một số thông tin nội bộ được lấy từ tài liệu: ${content}. \nCâu hỏi của người dùng: ${prompt}.\nHãy dựa vào thông tin trên để trả lời tự nhiên, dễ hiểu.\nNếu thông tin không có trong dữ liệu, hãy trả lời rằng bạn không có thông tin.\nTuyệt đối không bịa ra câu trả lời.`;
    } else {
      return `Câu hỏi của người dùng: ${prompt}.\nHãy trả lời dựa trên kiến thức của bạn một cách tự nhiên, dễ hiểu.\nTuyệt đối không bịa ra câu trả lời.`;
    }
  }

  async generateEmbedding(prompt: string): Promise<any> {
    try {
      const response = await this.googleGenAI.models.embedContent({
        model: this.embeddingModel,
        contents: prompt,
      });

      return response;
    } catch (error) {
      throw new Error(
        `Failed to get embedding from Gemini API: ${error.message}`,
      );
    }
  }

  async generateResponse(prompt: string): Promise<any> {
    try {
      const embedding = await this.generateEmbedding(prompt);
      const query = await this.documentChunksRepository.findClosestByEmbedding(
        embedding.embeddings[0].values,
      );

      const content = query?.content || null;
      const inDocuments = content ? true : false;

      const response = await this.googleGenAI.models.generateContent({
        model: this.completionModel,
        contents: [
          {
            parts: [
              {
                text: this.modelKnowledge,
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

      const data = {
        content: response.candidates?.[0]?.content?.parts?.[0]?.text ?? null,
        model: this.completionModel,
        inDocument: inDocuments,
      };

      return data;
    } catch (error) {
      throw new Error(
        `Failed to get response from Gemini API: ${error.message}`,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OpenaiService {
  private readonly apiKey: string;
  private readonly endpoint: string =
    'https://api.openai.com/v1/chat/completions';
  private readonly model: string = 'gpt-4o-mini';
  private readonly maxTokens: number = 100;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY ?? '';
  }
  async generateText(prompt: string): Promise<any> {
    try {
      const formattedPrompt = `
      Please provide a well-formatted and readable answer to the following question:
       ${prompt}

       The output should be free of any unnecessary escape characters, and if it's code, it should be indented and properly structured.
      `;
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [
            {
              role: 'user',
              content: formattedPrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return this.handleApiResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data.error;

        throw new Error(
          `Failed to fetch from OpenAI API. Details: ${detail.code}`,
        );
      } else {
        throw new Error(
          `Failed to fetch from OpenAI API. Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  async generateReponse(prompt: string): Promise<any> {
    try {
      const formattedPrompt = `
      Please provide a well-formatted and readable answer to the following question:
       ${prompt}

       The output should be free of any unnecessary escape characters, and if it's code, it should be indented and properly structured.
      `;
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [
            {
              role: 'user',
              content: formattedPrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return this.handleApiResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data.error;

        throw new Error(
          `Failed to fetch from OpenAI API. Details: ${detail.code}`,
        );
      } else {
        throw new Error(
          `Failed to fetch from OpenAI API. Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private handleApiResponse(response: any): any {
    if (response.choices && response.choices.length > 0) {
      return {
        content: response.choices[0].message.content,
        model: response.model,
      };
    }
    throw new Error('Invalid API response from OpenAI API');
  }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OpenaiService {
  private readonly apiKey: string;
  private readonly endpoint: string = 'https://api.openai.com/v1/completions';

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
          model: 'gpt-4o-mini',
          prompt: formattedPrompt,
          max_tokens: 100,
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
      throw new Error('Failed to fetch from OpenAI API');
    }
  }

  private handleApiResponse(response: any): any {
    if (response.choices && response.choices.length > 0) {
      return {
        text: response.choices[0].text,
        model: response.model,
      };
    }
    throw new Error('Invalid API response from OpenAI API');
  }
}

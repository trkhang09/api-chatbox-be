import { Injectable } from '@nestjs/common';

export interface AiService {
  generateStreamResponse(prompt: string);
}

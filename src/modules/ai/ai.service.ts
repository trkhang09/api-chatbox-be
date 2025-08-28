import { Injectable } from '@nestjs/common';

export interface AiService {
  generateResponse(prompt: string);
}

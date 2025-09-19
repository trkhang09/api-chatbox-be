import { Injectable } from '@nestjs/common';

export interface AiService {
  generateStreamResponse(
    prompt: string,
    isAllowExternal: boolean,
    userId: string,
  );
  generateStreamResponseNoLogin(prompt: string);
}

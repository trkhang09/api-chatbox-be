import { Body, Controller, Post, Res } from '@nestjs/common';
import { MessagesService } from './messages.service';
import type { Response } from 'express';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('ai/without-login')
  async createdAIMessageWithoutLogin(
    @Body() question: string,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    //pending Gemini AI Service
    // await this.geminiService.streamResponse(prompt, (text) => {
    //     res.write(`data: ${text}\n\n`); // gửi chunk
    // });
    // res.write(`event: end\ndata: [DONE]\n\n`);
    // res.end();

    // Giả lập text chia thành các chunk
    const fakeChunks = [
      'Xin chào, ',
      'tôi là AI ',
      'và tôi đang ',
      'trả lời ',
      'theo dạng streaming.',
    ];

    let index = 0;

    const interval = setInterval(() => {
      if (index < fakeChunks.length) {
        res.write(`data: ${fakeChunks[index]}\n\n`);
        index++;
      } else {
        clearInterval(interval);
        res.write(`event: end\ndata: [DONE]\n\n`);
        res.end();
      }
    }, 500);
  }
}

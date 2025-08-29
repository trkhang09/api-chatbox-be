import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from '../messages/messages.module';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../gemini/gemini.service';
import { OpenaiService } from '../openai/openai.service';
import { GeminiModule } from '../gemini/gemini.module';
import { OpenaiModule } from '../openai/openai.module';
import { AiProvider } from '../ai/ai.provider';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    forwardRef(() => MessagesModule),
    GeminiModule,
    OpenaiModule,
  ],
  providers: [ChatService, AiProvider, ChatRepository],
  controllers: [ChatController],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}

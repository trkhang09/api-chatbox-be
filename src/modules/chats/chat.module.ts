import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from '../messages/messages.module';
import { GeminiModule } from '../gemini/gemini.module';
import { OpenaiModule } from '../openai/openai.module';
import { AiProvider } from '../ai/ai.provider';
import { ChatRepository } from './chat.repository';
import { DataSource } from 'typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    forwardRef(() => MessagesModule),
    GeminiModule,
    OpenaiModule,
    UsersModule,
  ],
  providers: [
    {
      provide: ChatRepository,
      useFactory: (dataSource: DataSource) => new ChatRepository(dataSource),
      inject: [DataSource],
    },
    ChatService,
    AiProvider,
  ],
  controllers: [ChatController],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}

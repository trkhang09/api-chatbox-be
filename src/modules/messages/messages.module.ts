import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/messages.entity';
import { ChatModule } from '../chats/chat.module';
import { GeminiModule } from '../gemini/gemini.module';
import { Chat } from '../chats/entities/chat.entity';
import { MessageRepository } from './message.repository';
import { DataSource } from 'typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Chat]),
    forwardRef(() => ChatModule),
    forwardRef(() => GeminiModule),
    forwardRef(() => UsersModule),
  ],
  providers: [
    {
      provide: MessageRepository,
      useFactory: (dataSource: DataSource) => new MessageRepository(dataSource),
      inject: [DataSource],
    },
    MessagesService,
    MessageRepository,
  ],
  controllers: [MessagesController],
  exports: [MessagesService, MessageRepository],
})
export class MessagesModule {}

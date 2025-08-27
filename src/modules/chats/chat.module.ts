import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessagesService } from '../messages/messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat])],
  providers: [ChatService, MessagesService],
  controllers: [ChatController],
})
export class ChatsModule {}

import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessagesService } from '../messages/messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat])],
  providers: [ChatsService, MessagesService],
  controllers: [ChatsController],
})
export class ChatsModule {}

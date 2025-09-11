import { forwardRef, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { MessagesModule } from '../messages/messages.module';
import { UsersRepository } from '../users/users.repository';

@Module({
  imports: [forwardRef(() => MessagesModule)],
  providers: [SocketGateway, SocketService, UsersRepository],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}

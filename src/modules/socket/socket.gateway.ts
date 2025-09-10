import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters';
import { MessagesService } from '../messages/messages.service';
import { emit } from 'process';
import { createMessageDto } from '../messages/dtos/create-message.dto';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
@UseFilters(new WsExceptionFilter())
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;
  public onlineUsers = new Map<string, string[]>();

  constructor(
    private readonly socketService: SocketService,
    private readonly configService: ConfigService,
    private readonly messageService: MessagesService,
    private readonly userRepository: UsersRepository,
  ) {}

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
    // console.log(
    //   'Socket.IO listening at PORT = ' +
    //   this.configService.get<number>('WEBSK_PORT') + new Date(),
    // );
  }

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    if (!data) {
      socket.emit('responseMessage', {
        code: 500,
        message: 'Data is required!',
        data: null,
      });
    }

    const response = {
      code: 200,
      message: 'success',
      data: { text: `Hello ${data}` },
    };
    socket.emit('responseMessage', response);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(chatId);
    console.log(`Client ${client.id} joined room ${chatId}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.onlineUsers.has(data.userId)) {
      this.onlineUsers.set(data.userId, []);
    }

    const sockets = this.onlineUsers.get(data.userId);
    if (sockets && !sockets.includes(client.id)) {
      sockets.push(client.id);
    }

    console.log(`✅ User ${data.userId} registered with socket ${client.id}`);
    console.log(this.onlineUsers);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.onlineUsers.entries()) {
      this.onlineUsers.set(
        userId,
        sockets.filter((sid) => sid !== client.id),
      );

      // nếu user không còn socket nào thì xoá khỏi map
      if (this.onlineUsers.get(userId)?.length === 0) {
        this.onlineUsers.delete(userId);
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { query: createMessageDto; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📩 Received message from client:', data);

    // gọi service để lưu DB và emit cho users khác
    const message = await this.messageService.createMessage(
      data.query,
      data.creatorId,
    );
    client.emit('sendMessageSuccess', message);

    const ortherUserInChat = await this.userRepository.findOtherUsersInChat(
      data.query.chatId,
      data.creatorId,
    );

    const sockets = this.onlineUsers.get(ortherUserInChat.id);
    if (sockets) {
      sockets.forEach((sid) => {
        this.server.to(sid).emit('responseMessage', {
          code: 200,
          message: 'success',
          data: message,
        });
      });
    }
  }
}

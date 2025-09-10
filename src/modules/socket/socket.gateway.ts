import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters';
import { MessagesService } from '../messages/messages.service';
import { createMessageDto } from '../messages/dtos/create-message.dto';
import { UsersRepository } from '../users/users.repository';
import { EditMessageDto } from '../messages/dtos/edit-message.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
@UseFilters(new WsExceptionFilter())
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;
  private onlineUsers = new Map<string, string[]>();
  private currentChat = new Map<string, string | null>();

  constructor(
    private readonly socketService: SocketService,
    private readonly configService: ConfigService,
    private readonly messageService: MessagesService,
    private readonly userRepository: UsersRepository,
  ) {}

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
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
  }
  @SubscribeMessage('signOut')
  handleSignOut(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sockets = this.onlineUsers.get(data.userId);

    if (sockets) {
      const updatedSockets = sockets.filter((id) => id !== client.id);
      if (updatedSockets.length > 0) {
        this.onlineUsers.set(data.userId, updatedSockets);
      } else {
        this.onlineUsers.delete(data.userId);
      }
    }
  }
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() body: { userId: string; chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.currentChat.set(body.userId, body.chatId);
  }
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @MessageBody() body: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.currentChat.set(body.userId, null);
  }
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: { query: createMessageDto; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.createMessage(
      body.query,
      body.creatorId,
    );
    client.emit('sendMessageSuccess', message);

    const ortherUserInChat = await this.userRepository.findReceiver(
      body.query.chatId,
      body.creatorId,
    );
    const sockets = this.onlineUsers.get(ortherUserInChat.id);
    const openedChat = this.currentChat.get(ortherUserInChat.id);
    const unreadMessages = await this.messageService.getUnreadMessagesInChat(
      body.query.chatId,
    );

    if (sockets) {
      sockets.forEach((sid) => {
        if (openedChat === body.query.chatId) {
          this.server.to(sid).emit('responseMessage', {
            code: 200,
            message: 'success',
            body: message,
          });
        } else {
          this.server.to(sid).emit('chatNotification', {
            chatId: body.query.chatId,
            unreadMessages: unreadMessages,
            unreadCount: unreadMessages.length,
          });
        }
      });
    }
  }
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody()
    body: { query: EditMessageDto; chatId: string; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.editContentMessage(
      body.query,
      body.creatorId,
    );
    const receiver = await this.userRepository.findReceiver(
      body.chatId,
      body.creatorId,
    );
    const sockets = this.onlineUsers.get(receiver.id);
    if (sockets) {
      sockets.forEach((sid) => {
        this.server.to(sid).emit('responseMessage', {
          code: 200,
          message: 'success',
          body: message,
        });
      });
    }
  }
  @SubscribeMessage('retrieveMessage')
  async handleSoftRemoveMessage(
    @MessageBody()
    body: { messageId: string; chatId: string; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const ortherUserInChat = await this.userRepository.findReceiver(
      body.chatId,
      body.creatorId,
    );

    try {
      const deletedResult = await this.messageService.softRemoveMessage(
        body.messageId,
        body.creatorId,
      );
      if (!deletedResult) {
        client.emit('error', {
          message: 'Message not found or cannot be deleted',
        });
        return;
      }
      const sockets = this.onlineUsers.get(ortherUserInChat.id);
      if (sockets) {
        sockets.forEach((sid) => {
          this.server.to(sid).emit('responseMessage', {
            code: 200,
            message: 'success',
          });
        });
      }
    } catch (error) {
      client.emit('error', {
        message: 'Failed to delete message',
        details: error.message,
      });
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.onlineUsers.entries()) {
      this.onlineUsers.set(
        userId,
        sockets.filter((sid) => sid !== client.id),
      );

      if (this.onlineUsers.get(userId)?.length === 0) {
        this.onlineUsers.delete(userId);
      }
    }
  }
}

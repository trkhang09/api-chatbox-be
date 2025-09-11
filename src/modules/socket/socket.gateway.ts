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
import { HttpStatus, UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters';
import { MessagesService } from '../messages/messages.service';
import { createMessageDto } from '../messages/dtos/create-message.dto';
import { UsersRepository } from '../users/users.repository';
import { EditMessageDto } from '../messages/dtos/edit-message.dto';
import { RespondMessageDto } from '../messages/dtos/respond-message.dto';
import { UserDto } from '../users/dtos/user.dto';
import { SocketType } from 'src/common/constants/socket.constaints';
import { ResponseSocketDto } from './dtos/response-socket.dto';

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
    private readonly messageService: MessagesService,
    private readonly userRepository: UsersRepository,
  ) {}

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }

  @SubscribeMessage(SocketType.REGISTER)
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

  @SubscribeMessage(SocketType.SIGNOUT)
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

  @SubscribeMessage(SocketType.JOINCHAT)
  handleJoinChat(
    @MessageBody() body: { userId: string; chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.currentChat.set(body.userId, body.chatId);
  }

  @SubscribeMessage(SocketType.LEAVECHAT)
  handleLeaveChat(
    @MessageBody() body: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.currentChat.set(body.userId, null);
  }

  @SubscribeMessage(SocketType.SENDMESSAGE)
  async handleSendMessage(
    @MessageBody() body: { query: createMessageDto; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.createMessage(
      body.query,
      body.creatorId,
    );
    const receiver = await this.userRepository.findReceiver(
      body.query.chatId,
      body.creatorId,
    );
    this.notifyReceiver(receiver, body.query.chatId, message);
  }

  @SubscribeMessage(SocketType.EDITMESSAGE)
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
    this.notifyReceiver(receiver, body.chatId, message);
  }

  @SubscribeMessage(SocketType.RETRIEVEMESSAGE)
  async handleSoftRemoveMessage(
    @MessageBody()
    body: { messageId: string; chatId: string; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = await this.userRepository.findReceiver(
      body.chatId,
      body.creatorId,
    );

    try {
      const deletedResult = await this.messageService.softRemoveMessage(
        body.messageId,
      );
      if (!deletedResult) {
        const errorResponse = new ResponseSocketDto({
          code: HttpStatus.NOT_FOUND,
          message: 'Message not found or cannot be deleted',
        });
        client.emit(SocketType.ERROR, errorResponse);
        return;
      }
      if (receiver) {
        const sockets = this.onlineUsers.get(receiver.id);
        const openedChat = this.currentChat.get(receiver.id);
        if (sockets) {
          sockets.forEach((sid) => {
            if (openedChat === body.chatId) {
              const response = new ResponseSocketDto({
                code: HttpStatus.OK,
                message: 'success',
                data: {
                  id: body.messageId,
                  deletedResult: deletedResult,
                },
              });
              this.server
                .to(sid)
                .emit(SocketType.RESPONSERETRIEVEMESSAGE, response);
            }
          });
        }
      }
    } catch (error) {
      const errorResponse = new ResponseSocketDto({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete message',
        data: {
          details: error.message,
        },
      });
      client.emit(SocketType.ERROR, errorResponse);
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

  private async notifyReceiver(
    receiver: UserDto | null,
    chatId: string,
    message: RespondMessageDto,
  ) {
    if (receiver) {
      const sockets = this.onlineUsers.get(receiver.id);
      const openedChat = this.currentChat.get(receiver.id);
      const unreadMessages =
        await this.messageService.getUnreadMessagesInChat(chatId);

      if (sockets) {
        sockets.forEach((sid) => {
          if (openedChat === chatId) {
            const response = new ResponseSocketDto({
              code: HttpStatus.OK,
              message: 'success',
              data: message,
            });
            this.server.to(sid).emit(SocketType.RESPONSEMESSAGE, response);
          } else {
            const notification = new ResponseSocketDto({
              code: HttpStatus.OK,
              message: 'success',
              data: {
                chatId: chatId,
                unreadMessages: unreadMessages,
                unreadCount: unreadMessages.length,
              },
            });
            this.server.to(sid).emit(SocketType.CHATNOTIFICATION, notification);
          }
        });
      }
    }
  }
}

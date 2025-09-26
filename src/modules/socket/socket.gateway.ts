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
import { CreateMessageDto } from '../messages/dtos/create-message.dto';
import { UsersRepository } from '../users/users.repository';
import { EditMessageDto } from '../messages/dtos/edit-message.dto';
import { RespondMessageDto } from '../messages/dtos/respond-message.dto';
import { SocketType } from 'src/common/constants/socket.constaints';
import { ResponseSocketDto } from './dtos/response-socket.dto';
import { SocketActionType } from 'src/common/constants/socket-action.constaints';

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

  @SubscribeMessage(SocketType.SIGN_OUT)
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

  @SubscribeMessage(SocketType.JOIN_CHAT)
  async handleJoinChat(
    @MessageBody()
    body: { userId: string; chatId: string; messageIds: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    this.currentChat.set(body.userId, body.chatId);

    const messages = await this.messageService.readMessages(body.messageIds);
    const receiver = await this.userRepository.findReceiver(
      body.chatId,
      body.userId,
    );
    const response = new ResponseSocketDto({
      code: HttpStatus.OK,
      message: 'success',
      data: messages,
    });
    if (receiver) {
      const receiverSockets = this.onlineUsers.get(receiver.id);
      const openedChat = this.currentChat.get(receiver.id);
      if (receiverSockets) {
        receiverSockets.forEach((sid) => {
          if (openedChat === body.chatId) {
            this.server
              .to(sid)
              .emit(SocketType.RESPONSE_READ_MESSAGE, response);
          }
        });
      }
    }
    const userSockets = this.onlineUsers.get(body.userId);
    if (userSockets) {
      userSockets.forEach((sid) => {
        this.server.to(sid).emit(SocketType.RESPONSE_READ_MESSAGE, response);
      });
    }
  }

  @SubscribeMessage(SocketType.LEAVE_CHAT)
  handleLeaveChat(
    @MessageBody() body: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.currentChat.set(body.userId, null);
  }

  @SubscribeMessage(SocketType.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() body: { query: CreateMessageDto; creatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('bbbbb----');
    let readMessage: RespondMessageDto = new RespondMessageDto({});
    const action = SocketActionType.CREATE;
    const message = await this.messageService.createMessage(
      body.query,
      body.creatorId,
    );
    console.log('oooo-', body);
    const receiver = await this.userRepository.findReceiver(
      body.query.chatId,
      body.creatorId,
    );
    console.log('ffff---', receiver);

    if (receiver) {
      console.log('aaaa---', receiver);
      const receiverCurrentChat = this.currentChat.get(receiver.id);

      if (receiverCurrentChat === body.query.chatId) {
        const readMessages = await this.messageService.readMessages([
          message.id,
        ]);
        if (readMessages.length > 0) {
          readMessage = readMessages[0];
        }
      }
      this.notifyReceiver(receiver.id, body.query.chatId, message, action);
      this.notifyReceiver(
        body.creatorId,
        body.query.chatId,
        receiverCurrentChat === body.query.chatId ? readMessage : message,
        action,
      );
    }
    client.emit('error', {
      code: HttpStatus.NOT_FOUND,
      message: 'Receiver Not Found!',
    });
  }

  @SubscribeMessage(SocketType.EDIT_MESSAGE)
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
    const action = SocketActionType.EDIT;
    if (receiver) {
      this.notifyReceiver(receiver.id, body.chatId, message, action);
      this.notifyReceiver(body.creatorId, body.chatId, message, action);
    }
  }

  @SubscribeMessage(SocketType.RETRIEVE_MESSAGE)
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
      const message = await this.messageService.softRemoveMessage(
        body.messageId,
      );
      if (!message) {
        const errorResponse = new ResponseSocketDto({
          code: HttpStatus.NOT_FOUND,
          message: 'Message not found or cannot be deleted',
        });
        client.emit(SocketType.ERROR, errorResponse);
        return;
      }
      if (receiver) {
        const receiverSockets = this.onlineUsers.get(receiver.id);
        const senderSockets = this.onlineUsers.get(body.creatorId);
        const openedChat = this.currentChat.get(receiver.id);
        const response = new ResponseSocketDto({
          code: HttpStatus.OK,
          message: 'success',
          data: message,
        });
        if (receiverSockets) {
          receiverSockets.forEach((sid) => {
            if (openedChat === body.chatId) {
              this.server
                .to(sid)
                .emit(SocketType.RESPONSE_RETRIEVE_MESSAGE, response);
            }
          });
        }
        if (senderSockets) {
          senderSockets.forEach((sid) => {
            this.server
              .to(sid)
              .emit(SocketType.RESPONSE_RETRIEVE_MESSAGE, response);
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
    receiverId: string,
    chatId: string,
    message: RespondMessageDto,
    action: SocketActionType,
  ) {
    const receiverSockets = this.onlineUsers.get(receiverId);
    const openedChat = this.currentChat.get(receiverId);

    const unreadMessages =
      await this.messageService.getUnreadMessagesInChat(chatId);

    const response = new ResponseSocketDto({
      code: HttpStatus.OK,
      message: 'success',
      data: {
        message: message,
        action: action,
      },
    });

    if (receiverSockets) {
      receiverSockets.forEach((sid) => {
        if (openedChat === chatId) {
          this.server.to(sid).emit(SocketType.RESPONSE_MESSAGE, response);
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
          this.server.to(sid).emit(SocketType.CHAT_NOTIFICATION, notification);
        }
      });
    }
  }
}

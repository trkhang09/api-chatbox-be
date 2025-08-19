import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, WsException, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'chat',
})
@UseFilters(new WsExceptionFilter())
export class SocketGateway implements OnGatewayConnection {
    @WebSocketServer()
    private server: Server;
    constructor(
        private readonly socketService: SocketService,
        private readonly configService: ConfigService
    ) { }

    handleConnection(socket: Socket): void {
        this.socketService.handleConnection(socket);
        console.log('Socket.IO listening at PORT = ' + this.configService.get<number>('WEBSK_PORT'));
    }

    @SubscribeMessage('hello')
    handleEvent(
        @MessageBody() data: string,
        @ConnectedSocket() socket: Socket,
    ) {
        if (!data) {
            socket.emit('helloResponse', { code: 500, message: 'Data is required!', data: null });
        }

        const response = {
            code: 200,
            message: 'success',
            data: { text: `Hello ${data}` },
        };

        socket.emit('helloResponse', response);
    }


}
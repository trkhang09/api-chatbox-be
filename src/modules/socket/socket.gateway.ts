import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, WsException, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';

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
        @MessageBody() data: any,
        @ConnectedSocket() socket: Socket,
    ) {
        const response = {
            code: 0,
            message: 'success',
            data: { text: `Hello ${data.data}` },
        };
        
        if (!data) {
        socket.emit('hello', 'loi');
            throw new WsException('Data is required!');
        }
        
        socket.emit('hello', response);
        
    }


}
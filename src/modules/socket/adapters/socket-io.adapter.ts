import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocketIoAdapter extends IoAdapter {
    constructor(private configService: ConfigService) {
        super();
    }

    createIOServer(port: number) {
        const wsPort = this.configService.get<number>('WEBSK_PORT') ?? 4000;

        return super.createIOServer(wsPort);
    }
}

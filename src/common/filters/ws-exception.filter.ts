import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException)
export default class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    const error = exception.getError();
    const response =
      typeof error === 'string'
        ? { code: 9999, message: error, data: null }
        : { code: 9999, ...error };

    client.emit('exception', response);
  }
}

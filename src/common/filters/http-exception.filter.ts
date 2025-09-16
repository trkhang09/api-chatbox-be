import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';
import { isArray } from 'class-validator';
import ReasonStatusCode from '../utils/reason-phrases';

@Catch()
export default class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ReasonStatusCode.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const dto = new GetHttpResponseDto();
    dto.statusCode = status;
    dto.message =
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      process.env.NODE_ENV === 'production'
        ? [ReasonStatusCode.INTERNAL_SERVER_ERROR]
        : isArray(message)
          ? message
          : [message];
    dto.timestamp = new Date();
    dto.path = request.url;

    response.status(status).json(dto);
  }
}

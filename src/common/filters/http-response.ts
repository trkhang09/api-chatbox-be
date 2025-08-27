import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetHttpResponseDto } from '../dtos/get-http-response.dto';

@Injectable()
export default class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const dto = new GetHttpResponseDto();
        dto.statusCode = HttpStatus.OK;
        dto.message = ['success'];
        dto.data = data as T;
        dto.timestamp = new Date();
        return dto;
      }),
    );
  }
}

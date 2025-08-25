import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const clientId = request.headers['x-client-id'];

    return next.handle().pipe(
      map((data) => {
        const { user } = data;
        if (clientId === 'admin') {
          if (user.role !== 'user') {
            return data;
          } else {
            throw new ForbiddenException('login failed');
          }
        }
        return data;
      }),
    );
  }
}

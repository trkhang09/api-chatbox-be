import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { clientIdConstants } from 'src/common/constants/clientId-constants';
import { headerConstants } from 'src/common/constants/header-constants';
import { RoleType } from 'src/common/constants/role-constants';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const clientId = request.headers[headerConstants.xClientId];

    return next.handle().pipe(
      map((data) => {
        const { user } = data;
        if (clientId === clientIdConstants.admin) {
          if (user.role !== RoleType.USER.toLowerCase()) {
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

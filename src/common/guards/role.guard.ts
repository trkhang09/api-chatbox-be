import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { RoleType } from '../constants/role-constants';
import { IS_FILE_SECURITY_KEY } from '../decorators/file-security-key.decorator';
import { headerConstants } from '../constants/header-constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isFileSecurityKey = this.reflector.getAllAndOverride<boolean>(
      IS_FILE_SECURITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isFileSecurityKey) {
      const fileKey = request.headers[headerConstants.xFileSecurityKey];
      const fileSystemKey = process.env.FILE_SECURITY_KEY;
      if (fileKey && fileKey === fileSystemKey) {
        return true;
      }
    }
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}

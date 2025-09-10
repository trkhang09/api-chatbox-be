import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { PermissionsService } from 'src/modules/permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();

    const userPermissions =
      await this.permissionsService.findPermissionsByRoleId({
        roleId: user.roleId,
        page: 0,
        size: 0,
      });

    const userPermissionCodes = userPermissions.map((p) => p.code);

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissionCodes.includes(permission),
    );
    if (!hasPermission) {
      throw new ForbiddenException('You do not have required permissions');
    }

    return true;
  }
}

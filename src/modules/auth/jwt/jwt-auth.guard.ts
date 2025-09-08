import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { clientIdConstants } from 'src/common/constants/clientId-constants';
import { headerConstants } from 'src/common/constants/header-constants';
import { jwtConstants } from 'src/common/constants/jwt-constants';
import { IS_FILE_SECURITY_KEY } from 'src/common/decorators/file-security-key.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isFileSecurityKey = this.reflector.getAllAndOverride<boolean>(
      IS_FILE_SECURITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isFileSecurityKey) {
      const fileKey = request.headers['file-security-key'];
      const fileSystemKey = process.env.FILE_SECURITY_KEY;
      if (fileKey && fileKey === fileSystemKey) {
        return true;
      }
    }

    const clientId = request.headers[headerConstants.xClientId];
    if (
      !clientId ||
      (clientId &&
        ![clientIdConstants.ADMIN, clientIdConstants.APP].includes(clientId))
    ) {
      throw new UnauthorizedException('x-client-id invalid');
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized 1');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Unauthorized 2');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

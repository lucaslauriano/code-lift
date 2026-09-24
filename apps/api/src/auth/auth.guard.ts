import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SESSION_COOKIE } from '../config/env';
import { IS_PUBLIC_KEY } from '../common/public.decorator';
import type { AuthenticatedRequest } from '../common/current-user.decorator';
import { AuthService } from './auth.service';

/**
 * Registered globally in AppModule, so every route is protected by default and `@Public()` is the
 * documented way out.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = (request.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE];
    if (!token) throw new UnauthorizedException('Not signed in');

    const user = await this.auth.userFromToken(token);
    if (!user) throw new UnauthorizedException('Session expired');

    request.user = user;
    return true;
  }
}

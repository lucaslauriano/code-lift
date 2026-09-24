import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionUser } from '@code-lift/shared';

export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

/** Reads the user the auth guard attached to the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new Error('CurrentUser used on a route that is not behind the auth guard');
    }
    return request.user;
  },
);

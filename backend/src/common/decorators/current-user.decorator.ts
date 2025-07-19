import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

interface IUser {
  id: number;
}

interface IRequestWithUser extends FastifyRequest {
  user?: IUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser | null => {
    const request = ctx.switchToHttp().getRequest<IRequestWithUser>();
    const user = request.user;
    if (user && typeof user.id === 'number') {
      return user;
    }
    return null;
  },
);

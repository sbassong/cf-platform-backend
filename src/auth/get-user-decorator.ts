import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../user/schemas/user.schema';

/**
 * Custom decorator to extract the user object from the request.
 * The user object is attached to the request by the JwtStrategy.
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

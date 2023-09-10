import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * get logged user custom decorator
 */
export const GetUserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = { jwt: request.headers['authorization']?.split(' ')[1] };


    return token.jwt;
  },
);

import { Request } from 'express';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator((key: keyof User, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<Request & { user: User }>();
  return key ? req.user[key] : req.user;
});

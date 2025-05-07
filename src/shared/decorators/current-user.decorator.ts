import { Request } from 'express';

import { User } from '@/generated/prisma';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((key: keyof User, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<Request & { user: User }>();
  return key ? req.user[key] : req.user;
});

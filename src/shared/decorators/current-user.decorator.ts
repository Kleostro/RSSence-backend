import { Request } from 'express';

import { UserWithProfileAndAuthor } from '@/modules/users/types/user.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((key: keyof UserWithProfileAndAuthor, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<Request & { user: UserWithProfileAndAuthor }>();
  return key ? req.user[key] : req.user;
});

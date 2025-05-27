import { Request } from 'express';

import { FullUserInfoType } from '@/modules/users/types/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((key: keyof FullUserInfoType, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<Request & { user: FullUserInfoType }>();
  return key ? req.user[key] : req.user;
});

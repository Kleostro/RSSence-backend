import { Prisma } from '@/generated/prisma';

export type UserWithProfileAndAuthor = Prisma.UserGetPayload<{
  include: { profile: true; author: true; moderator: true };
  omit: { hashedPassword: true };
}>;

export type FullUser = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } }; profile: true; author: true; moderator: true };
  omit: { hashedPassword: true };
}>;

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
  omit: { hashedPassword: true };
}>;

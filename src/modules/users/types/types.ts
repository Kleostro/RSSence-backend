import { Author, Profile, User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'hashedPassword'>;

export type UserWithRelations = User & {
  roles: string[];
  author: Author | null;
  profile: Profile | null;
};

export type UserWithRelationsWithoutPassword = Omit<UserWithRelations, 'hashedPassword'>;

import { Author, Profile, User } from '@/generated/prisma';

export type UserWithoutPassword = Omit<User, 'hashedPassword'>;

export type UserWithRelations = User & {
  roles: string[];
  profile: Profile | null;
};

export type UserWithRelationsWithoutPassword = Omit<UserWithRelations, 'hashedPassword'>;

export type FullUserInfoType = Omit<
  User & {
    roles: string[];
    profile: Profile | null;
    author: Author | null;
  },
  'hashedPassword'
>;

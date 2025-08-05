import { Author, Moderator, Profile, Role, User, UserRole } from '@/generated/prisma';

export type UserWithoutPassword = Omit<User, 'hashedPassword'>;

export type UserWithRelations = User & {
  roles: string[];
  profile?: Profile | null;
};

export type UserWithRoles = User & {
  roles: UserRole &
    {
      role: Role;
    }[];
};

export type UserWithRelationsWithoutPassword = Omit<UserWithRelations, 'hashedPassword'>;

export type FullUserInfoType = Omit<
  User & {
    roles: string[];
    profile: Profile | null;
    author: Author | null;
    moderator: Moderator | null;
  },
  'hashedPassword'
>;

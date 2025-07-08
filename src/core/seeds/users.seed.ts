import * as bcrypt from 'bcryptjs';

import { PrismaService } from '@/prisma/prisma.service';
import { ROLES } from '@/shared/constants/roles';
import { Logger } from '@nestjs/common';

const logger = new Logger('USERS_SEED');

interface SeedUser {
  email: string;
  password: string;
  roleNames: string[];
}

const USERS_TO_CREATE: SeedUser[] = [
  {
    email: 'johndoe@gmail.com',
    password: '11111111',
    roleNames: [ROLES.USER],
  },
  {
    email: 'moderator@mod.com',
    password: '11111111',
    roleNames: [ROLES.USER, ROLES.MODERATOR],
  },
  {
    email: 'admin@admin.com',
    password: '11111111',
    roleNames: [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN],
  },
  {
    email: 'superadmin@super.com',
    password: '11111111',
    roleNames: [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  },
];

export const seedUsers = async (prisma: PrismaService): Promise<void> => {
  logger.log('Seeding users...');
  const allRoles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(allRoles.map((role) => [role.name, role]));

  await Promise.all(
    USERS_TO_CREATE.map(async (userData) => {
      const { email, password, roleNames } = userData;

      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        logger.log(`User "${email}" already exists.`);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          roles: {
            create: roleNames.map((roleName) => ({
              role: {
                connect: { id: roleMap[roleName].id },
              },
            })),
          },
        },
      });

      logger.log(`User "${createdUser.email}" created with roles: ${roleNames.join(', ')}`);
    }),
  );
};

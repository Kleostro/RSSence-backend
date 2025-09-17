import * as bcrypt from 'bcryptjs';
import Chance from 'chance';

import { PrismaService } from '@/prisma/prisma.service';
import { ROLES } from '@/shared/constants/roles';
import { Logger } from '@nestjs/common';

const logger = new Logger('USERS_SEED');
const chance = new Chance();
const SALT_ROUNDS = 10;
const USER_COUNT = 100;

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

// eslint-disable-next-line max-lines-per-function
export const seedUsers = async (prisma: PrismaService): Promise<{ userIds: number[] }> => {
  logger.log('Seeding users...');

  const allRoles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(allRoles.map((role) => [role.name, role]));

  await Promise.all(
    USERS_TO_CREATE.map(async ({ email, password, roleNames }) => {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        logger.log(`User "${email}" already exists.`);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          roles: {
            create: roleNames.map((roleName) => ({
              role: { connect: { id: roleMap[roleName].id } },
            })),
          },
        },
      });

      if (roleNames.includes(ROLES.MODERATOR)) {
        await prisma.moderator.upsert({
          where: { userId: user.id },
          update: { userId: user.id },
          create: { userId: user.id },
        });
      }

      logger.log(`User "${email}" created with roles: ${roleNames.join(', ')}`);
    }),
  );

  const password = await bcrypt.hash('11111111', SALT_ROUNDS);
  const emails = Array.from({ length: USER_COUNT }, () => chance.email());

  const createdUsers = await Promise.all(
    emails.map(async (email) => {
      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword: password,
          roles: {
            create: { role: { connect: { name: ROLES.USER } } },
          },
        },
      });
      logger.log(`👤 Created user: ${email}`);
      return user;
    }),
  );

  logger.log(`✅ Created ${createdUsers.length} regular users.`);
  return { userIds: createdUsers.map((u) => u.id) };
};

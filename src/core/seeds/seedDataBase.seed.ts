import * as bcrypt from 'bcryptjs';

import { PrismaService } from '@/prisma/prisma.service';
import { ROLES } from '@/shared/constants/roles';
import { Logger } from '@nestjs/common';

const logger = new Logger('SEED');

async function createAdmin(prisma: PrismaService): Promise<void> {
  const adminEmail = 'admin@admin.com';
  const adminPassword = 'password';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        hashedPassword,
      },
    });
    logger.log(`Admin user "${adminEmail}" created.`);

    const adminRole = await prisma.role.findUnique({ where: { name: ROLES.ADMIN } });
    if (adminRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: adminRole.id } });
      logger.log(`Role "ADMIN" assigned to user "${adminEmail}".`);
    }
  } else {
    logger.log('Admin user already exists.');
  }
}

async function createSuperAdmin(prisma: PrismaService): Promise<void> {
  const superAdminEmail = 'superadmin@super.com';
  const superAdminPassword = 'kitten-kitten';
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdminUser = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!superAdminUser) {
    const user = await prisma.user.create({
      data: {
        email: superAdminEmail,
        hashedPassword,
      },
    });
    logger.log(`Super admin user "${superAdminEmail}" created.`);

    const superAdminRole = await prisma.role.findUnique({ where: { name: ROLES.SUPER_ADMIN } });
    if (superAdminRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: superAdminRole.id } });
      logger.log(`Role "SUPER_ADMIN" assigned to user "${superAdminEmail}".`);
    }
  } else {
    logger.log('Super admin user already exists.');
  }
}

export async function seedDatabase(prisma: PrismaService): Promise<void> {
  logger.log('Starting seeding...');
  const roles = [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];

  const existingRoles = await prisma.role.findMany({ where: { name: { in: roles } } });
  if (existingRoles.length === roles.length) {
    logger.log('Roles already exist.');
    return;
  }

  const unCreatedRoles = roles.filter((role) => !existingRoles.some((existingRole) => existingRole.name === role));

  Promise.all(
    unCreatedRoles.map(async (role) => {
      await prisma.role.create({ data: { name: role } });
      logger.log(`Role "${role}" created.`);
    }),
  );

  await createAdmin(prisma);
  await createSuperAdmin(prisma);

  logger.log('Seeding completed.');
}

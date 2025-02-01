import * as bcrypt from 'bcryptjs';

import { PrismaService } from '@/prisma.service';
import { ROLES } from '@/shared/constants/roles';
import { Logger } from '@nestjs/common';

export async function seedDatabase(prisma: PrismaService): Promise<void> {
  const logger = new Logger('SEED');
  logger.log('Starting seeding...');
  const roles = [ROLES.MODERATOR, ROLES.ADMIN];

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

  logger.log('Seeding completed.');
}

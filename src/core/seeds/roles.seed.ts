import { PrismaService } from '@/prisma/prisma.service';
import { ROLES } from '@/shared/constants/roles';
import { Logger } from '@nestjs/common';

const logger = new Logger('ROLES_SEED');

export const seedRoles = async (prisma: PrismaService): Promise<void> => {
  logger.log('Seeding roles...');

  const existingRoles = await prisma.role.findMany({
    where: { name: { in: Object.values(ROLES) } },
  });

  if (existingRoles.length === Object.keys(ROLES).length) {
    logger.log('All roles already exist.');
    return;
  }

  const uncreatedRoles = Object.values(ROLES).filter((roleName) => !existingRoles.some((r) => r.name === roleName));

  if (uncreatedRoles.length > 0) {
    await prisma.role.createMany({
      data: uncreatedRoles.map((name, index) => ({ name, priority: index + 1 })),
    });
    logger.log(`Created roles: ${uncreatedRoles.join(', ')}`);
  } else {
    logger.log('No new roles to create.');
  }
};

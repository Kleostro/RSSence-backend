import { PrismaService } from '@/prisma/prisma.service';
import { Logger } from '@nestjs/common';

import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';

const logger = new Logger('SEED');

export const seedDatabase = async (prisma: PrismaService): Promise<void> => {
  logger.log('Starting database seeding...');

  try {
    await seedRoles(prisma);
    await seedUsers(prisma);
    logger.log('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Error during database seeding:', error);
  }
};

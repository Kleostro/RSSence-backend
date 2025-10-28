import { PrismaService } from '@/prisma/prisma.service';
import { Logger } from '@nestjs/common';

import { seedAuthors } from './authors.seed';
// import { seedPostAuthors } from './post-author.seed';
import { seedProfiles } from './profiles.seed';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';

const logger = new Logger('Database Seeder');

export const runSeed = async (prisma: PrismaService): Promise<void> => {
  logger.log('🚀 Starting database seed process...');

  await seedRoles(prisma);

  const { userIds } = await seedUsers(prisma);
  logger.log(`✅ Users seeded: ${userIds.length}`);

  const { profileIds, usernames } = await seedProfiles(prisma, userIds);
  logger.log(`✅ Profiles seeded: ${profileIds.length}`);

  const { authorIds } = await seedAuthors(prisma, userIds, usernames);
  logger.log(`✅ Authors seeded: ${authorIds.length}`);

  // await seedPostAuthors(prisma, authorIds);
  // logger.log('✅ Posts and author relationships seeded');

  logger.log('🎉 Database seeding completed successfully!');
};

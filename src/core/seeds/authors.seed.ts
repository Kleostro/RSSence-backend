import Chance from 'chance';

import { PrismaService } from '@/prisma/prisma.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('AUTHORS_SEED');
const chance = new Chance();

export const seedAuthors = async (
  prisma: PrismaService,
  userIds: number[],
  usernamesFromProfiles: string[],
): Promise<{ authorIds: number[] }> => {
  logger.log('Seeding authors...');

  const authorsData = userIds.map((_, i) => ({
    firstname: chance.first(),
    lastname: chance.last(),
    username: usernamesFromProfiles[i],
    bio: chance.sentence({ words: 150 }),
    userId: userIds[i],
  }));

  const createdAuthors = await Promise.all(
    authorsData.map((data) =>
      prisma.author.create({
        data,
      }),
    ),
  );

  const authorIds = createdAuthors.map((a) => a.id);
  logger.log(`✅ Created ${authorIds.length} authors.`);
  return { authorIds };
};

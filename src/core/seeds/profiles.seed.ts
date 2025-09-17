import Chance from 'chance';

import { PrismaService } from '@/prisma/prisma.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('PROFILES_SEED');
const chance = new Chance();

export const seedProfiles = async (
  prisma: PrismaService,
  userIds: number[],
): Promise<{ profileIds: number[]; usernames: string[] }> => {
  logger.log('Seeding profiles...');

  const data = userIds.map(() => ({
    firstname: chance.first(),
    lastname: chance.last(),
    username: chance.word({ length: 8 }).toLowerCase() + chance.integer({ min: 10, max: 99 }),
    bio: chance.sentence({ words: 150 }),
    birthdate: chance.date({ year: 1990 }),
  }));

  const profiles = await Promise.all(
    userIds.map((userId, index) =>
      prisma.profile.create({
        data: {
          ...data[index],
          userId,
        },
      }),
    ),
  );

  const profileIds = profiles.map((p) => p.id);
  const usernames = profiles.map((p) => p.username);

  logger.log(`✅ Created ${profileIds.length} profiles.`);
  return { profileIds, usernames };
};

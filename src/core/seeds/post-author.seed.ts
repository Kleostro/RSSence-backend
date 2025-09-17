/* eslint-disable max-lines-per-function */
import Chance from 'chance';

import { PostStatus } from '@/generated/prisma';
import { POST_STATUS } from '@/modules/posts/constants/post';
import { PrismaService } from '@/prisma/prisma.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('POST_AUTHORS_SEED');
const chance = new Chance();

const POSTS_PER_AUTHOR_AS_MAIN = 30;
const POSTS_PER_AUTHOR_AS_COAUTHOR = 30;
const MIN_COAUTHORS = 1;
const MAX_COAUTHORS = 6;
const STATUSES: PostStatus[] = Object.values(POST_STATUS);

export const seedPostAuthors = async (prisma: PrismaService, authorIds: number[]): Promise<void> => {
  logger.log(`Seeding ${authorIds.length * (POSTS_PER_AUTHOR_AS_MAIN + POSTS_PER_AUTHOR_AS_COAUTHOR)} posts...`);

  await Promise.all(
    authorIds.map(async (authorId) => {
      const title = chance.sentence({ words: chance.integer({ min: 10, max: 20 }) });
      const postsData = Array.from({ length: POSTS_PER_AUTHOR_AS_MAIN }, () => ({
        title,
        content: chance.paragraph({ sentences: chance.integer({ min: 50, max: 500 }) }),
      }));

      await Promise.all(
        postsData.map(async (postData) => {
          await prisma.post.create({
            data: {
              ...postData,
              status: chance.pickone(STATUSES),
              authors: {
                create: {
                  author: { connect: { id: authorId } },
                  isMainAuthor: true,
                },
              },
              postVersions: {
                create: {
                  title: postData.title,
                  content: postData.content,
                  version: 1,
                  isCurrent: true,
                  author: { connect: { id: authorId } },
                },
              },
              postHistory: {
                create: {
                  actionType: 'POST_CREATED',
                  author: { connect: { id: authorId } },
                  description: 'Auto created post.',
                },
              },
            },
          });
        }),
      );
    }),
  );

  await Promise.all(
    authorIds.map(async (authorId) => {
      const coPostsData = Array.from({ length: POSTS_PER_AUTHOR_AS_COAUTHOR }, () => {
        const title = chance.sentence({ words: chance.integer({ min: 10, max: 20 }) });
        const content = chance.paragraph({ sentences: chance.integer({ min: 50, max: 500 }) });

        const totalAuthorsCount = chance.integer({ min: MIN_COAUTHORS, max: MAX_COAUTHORS });
        const otherAuthors = chance
          .pickset(
            authorIds.filter((id) => id !== authorId),
            totalAuthorsCount - 1,
          )
          .map((id) => ({ authorId: id, isMainAuthor: false }));

        const allCoauthors = [{ authorId, isMainAuthor: false }, ...otherAuthors];

        const mainAuthorIndex = chance.integer({ min: 0, max: allCoauthors.length - 1 });
        allCoauthors[mainAuthorIndex].isMainAuthor = true;

        return { title, content, coauthors: allCoauthors };
      });

      await Promise.all(
        coPostsData.map(async ({ title, content, coauthors }) => {
          const mainAuthor = coauthors.find((a) => a.isMainAuthor);
          if (!mainAuthor) {
            return;
          }

          await prisma.post.create({
            data: {
              title,
              content,
              status: chance.pickone(STATUSES),
              authors: {
                create: coauthors.map((coauthor) => ({
                  author: { connect: { id: coauthor.authorId } },
                  isMainAuthor: coauthor.isMainAuthor,
                })),
              },
              postVersions: {
                create: {
                  title,
                  content,
                  version: 1,
                  isCurrent: true,
                  author: { connect: { id: mainAuthor.authorId } },
                },
              },
              postHistory: {
                create: {
                  actionType: 'POST_CREATED',
                  author: { connect: { id: mainAuthor.authorId } },
                },
              },
            },
          });
        }),
      );
    }),
  );

  logger.log('✅ All posts and author relationships seeded.');
};

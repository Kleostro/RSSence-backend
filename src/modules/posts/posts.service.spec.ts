import { PrismaService } from '@/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthorsUtilService } from '../authors/services/authors-util.service';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, AuthorsUtilService, PrismaService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

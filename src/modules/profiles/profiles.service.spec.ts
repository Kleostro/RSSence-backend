import { PrismaService } from '@/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService, PrismaService],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Test, TestingModule } from '@nestjs/testing';

import { ProfilesService } from './profiles.service';
import { ProfilesUtilService } from './services/profiles-util.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService, PrismaService, FileService, ProfilesUtilService],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

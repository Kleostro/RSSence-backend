import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Test, TestingModule } from '@nestjs/testing';

import { ProfilesUtilService } from '../profiles/services/profiles-util.service';
import { AuthorsService } from './authors.service';
import { AuthorsUtilService } from './services/authors-util.service';

describe('AuthorsService', () => {
  let service: AuthorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorsService, AuthorsUtilService, PrismaService, FileService, ProfilesUtilService],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

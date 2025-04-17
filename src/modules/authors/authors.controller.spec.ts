import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Test, TestingModule } from '@nestjs/testing';

import { ProfilesUtilService } from '../profiles/services/profiles-util.service';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { AuthorsUtilService } from './services/authors-util.service';

describe('AuthorsController', () => {
  let controller: AuthorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [AuthorsService, PrismaService, FileService, AuthorsUtilService, ProfilesUtilService],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

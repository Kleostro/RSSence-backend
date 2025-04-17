import { PrismaService } from '@/prisma.service';
import { FileService } from '@/shared/services/file/file.service';
import { Test, TestingModule } from '@nestjs/testing';

import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesUtilService } from './services/profiles-util.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, PrismaService, FileService, ProfilesUtilService],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

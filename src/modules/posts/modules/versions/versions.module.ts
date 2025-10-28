import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { HistoryModule } from '../history/history.module';
import { DiffService } from '../utils/diff.service';
import { PostVersionsController } from './controllers/versions.controller';
import { VersionsService } from './services/versions.service';

@Module({
  imports: [HistoryModule],
  controllers: [PostVersionsController],
  providers: [VersionsService, DiffService, PostService],
  exports: [VersionsService],
})
export class VersionsModule {}

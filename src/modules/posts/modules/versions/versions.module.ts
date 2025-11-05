import { RolesService } from '@/modules/roles/roles.service';
import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { PostsAccessService } from '../../services/posts-access.service';
import { PostsService } from '../../services/posts.service';
import { HistoryModule } from '../history/history.module';
import { DiffService } from '../utils/diff.service';
import { PostVersionsController } from './controllers/versions.controller';
import { VersionsService } from './services/versions.service';

@Module({
  imports: [HistoryModule],
  controllers: [PostVersionsController],
  providers: [VersionsService, DiffService, PostService, PostsService, PostsAccessService, RolesService],
  exports: [VersionsService],
})
export class VersionsModule {}

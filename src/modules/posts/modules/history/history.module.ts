import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { PostHistoryService } from './services/post-history.service';

@Module({
  controllers: [],
  providers: [PostHistoryService, PostService],
  exports: [PostHistoryService, PostService],
})
export class HistoryModule {}
